const year = document.querySelector("#year");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionToggle = document.querySelector("[data-motion-toggle]");
const motionPreferenceKey = "portfolio-motion-preference";
let savedMotionPreference = null;

try {
  savedMotionPreference = window.localStorage.getItem(motionPreferenceKey);
} catch (error) {
  console.warn("Motion preference could not be read; using the system setting.", error);
}

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (motionToggle) {
  const setMotionEnabled = (enabled, savePreference = false) => {
    document.documentElement.classList.toggle("motion-enabled", enabled);
    document.documentElement.classList.toggle(
      "motion-preference-set",
      savePreference || savedMotionPreference !== null,
    );
    motionToggle.setAttribute("aria-pressed", String(enabled));
    motionToggle.textContent = enabled ? "Motion on" : "Motion off";
    motionToggle.setAttribute("aria-label", enabled ? "Turn motion off" : "Turn motion on");
    window.dispatchEvent(new CustomEvent("motionpreferencechange", { detail: { enabled } }));

    if (savePreference) {
      savedMotionPreference = enabled ? "enabled" : "disabled";
      try {
        window.localStorage.setItem(motionPreferenceKey, savedMotionPreference);
      } catch (error) {
        console.warn("Motion preference could not be saved for future visits.", error);
      }
    }
  };

  const motionEnabled = savedMotionPreference === "enabled"
    || (savedMotionPreference !== "disabled" && !reducedMotion.matches);
  setMotionEnabled(motionEnabled);
  motionToggle.addEventListener("click", () => {
    setMotionEnabled(motionToggle.getAttribute("aria-pressed") !== "true", true);
  });
} else if (!reducedMotion.matches) {
  document.documentElement.classList.add("motion-enabled");
}

const projectChapterCards = Array.from(document.querySelectorAll(".project-card[id^='project-']"));
const projectChapterLinks = Array.from(document.querySelectorAll("[data-project-chapter-link]"));
const projectProgressCount = document.querySelector("[data-project-progress-count]");
const projectProgressFill = document.querySelector("[data-project-progress-fill]");
const tourNumber = document.querySelector("[data-tour-number]");
const tourTitle = document.querySelector("[data-tour-title]");
const tourCaption = document.querySelector("[data-tour-caption]");
const projectScreenTitle = document.querySelector("[data-project-screen-title]");
const projectScreen = document.querySelector(".project-screen");
const projectList = document.querySelector(".project-list#selected-projects");
const projectTrack = document.querySelector(".project-track#project-track");
const workTourLayout = document.querySelector(".work-tour-layout");
const projectViewStatus = document.querySelector("[data-project-view-status]");
let activeProjectChapter = null;
let projectDeckEnabled = false;

const updateProjectViewStatus = (tab) => {
  if (!projectViewStatus || !tab) {
    return;
  }
  const tabs = Array.from(tab.closest("[role='tablist']")?.querySelectorAll("[role='tab']") ?? []);
  const viewIndex = tabs.indexOf(tab);
  if (viewIndex < 0) {
    return;
  }
  projectViewStatus.textContent = `${String(viewIndex + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")} · ${tab.textContent.trim().toUpperCase()}`;
};

const setActiveProjectChapter = (card) => {
  const chapterIndex = projectChapterCards.indexOf(card);
  if (chapterIndex < 0 || activeProjectChapter === card) {
    return;
  }
  activeProjectChapter = card;
  card.classList.add("is-visible");

  projectChapterLinks.forEach((link) => {
    const isActive = link.dataset.projectChapterLink === card.id;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (projectProgressCount) {
    projectProgressCount.textContent = String(chapterIndex + 1).padStart(2, "0");
  }
  if (tourNumber) {
    tourNumber.textContent = String(chapterIndex + 1).padStart(2, "0");
  }
  if (tourTitle) {
    tourTitle.textContent = card.dataset.guideTitle ?? card.querySelector("h3")?.textContent ?? "Selected work";
  }
  if (tourCaption) {
    tourCaption.textContent = card.dataset.guideCopy ?? card.querySelector(".project-summary")?.textContent.trim() ?? "A closer look at the work.";
  }
  if (projectScreenTitle) {
    projectScreenTitle.textContent = `WORKSPACE / ${(card.dataset.guideTitle ?? "SELECTED PROJECT").replace(/\s+/g, "-").toUpperCase()}`;
  }
  if (projectScreen && card.dataset.projectTheme) {
    projectScreen.dataset.projectTheme = card.dataset.projectTheme;
  }
  updateProjectViewStatus(card.querySelector(".viewer-tabs [aria-selected='true']"));
  if (projectProgressFill) {
    projectProgressFill.style.width = `${((chapterIndex + 1) / projectChapterCards.length) * 100}%`;
  }
};

const getProjectDeckMetrics = () => {
  if (!workTourLayout || !projectScreen) {
    return null;
  }
  const layoutBounds = workTourLayout.getBoundingClientRect();
  const pinTop = Number.parseFloat(getComputedStyle(projectScreen).top) || 0;
  const start = window.scrollY + layoutBounds.top - pinTop;
  const travel = Math.max(1, workTourLayout.offsetHeight - projectScreen.offsetHeight);
  return { start, travel };
};

const setProjectDeckAccessibility = (activeCard = null) => {
  projectChapterCards.forEach((card) => {
    const isCurrent = card === activeCard;
    card.inert = projectDeckEnabled && !isCurrent;
    if (projectDeckEnabled && !isCurrent) {
      card.setAttribute("aria-hidden", "true");
    } else {
      card.removeAttribute("aria-hidden");
    }
  });
};

const syncProjectDeckMode = () => {
  const shouldEnable = Boolean(
    projectChapterCards.length > 1
    && workTourLayout
    && projectList
    && projectTrack
    && projectScreen
    && window.matchMedia("(min-width: 1081px)").matches
    && document.documentElement.classList.contains("motion-enabled")
    && !reducedMotion.matches,
  );
  if (shouldEnable === projectDeckEnabled) {
    return;
  }

  projectDeckEnabled = shouldEnable;
  workTourLayout?.classList.toggle("is-scroll-deck", projectDeckEnabled);
  workTourLayout?.style.setProperty("--work-slide-count", String(projectChapterCards.length));
  if (projectDeckEnabled && projectList) {
    projectList.scrollLeft = 0;
  }
  if (!projectDeckEnabled && projectTrack) {
    projectTrack.style.removeProperty("transform");
  }
  setProjectDeckAccessibility(projectDeckEnabled ? activeProjectChapter : null);
  scheduleProjectTourUpdate();
};

const goToProjectChapter = (card, behavior = "smooth") => {
  const index = projectChapterCards.indexOf(card);
  const metrics = getProjectDeckMetrics();
  if (index < 0 || !metrics || !projectDeckEnabled || !workTourLayout) {
    return;
  }
  const progress = index / (projectChapterCards.length - 1);
  window.scrollTo({ top: metrics.start + metrics.travel * progress, behavior });
};

projectChapterLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetCard = projectChapterCards.find((card) => card.id === link.dataset.projectChapterLink);
    if (targetCard) {
      if (projectDeckEnabled) {
        event.preventDefault();
        window.history.pushState(null, "", `#${targetCard.id}`);
        goToProjectChapter(targetCard);
      }
      setActiveProjectChapter(targetCard);
    }
  });
});

const projectStorySteps = Array.from(document.querySelectorAll(".project-story-step[data-project-view]"));
let projectTourFrame = 0;
const updateProjectTour = () => {
  projectTourFrame = 0;
  if (projectDeckEnabled && projectList && projectTrack && workTourLayout) {
    const metrics = getProjectDeckMetrics();
    if (!metrics) {
      return;
    }
    const progress = Math.min(1, Math.max(0, (window.scrollY - metrics.start) / metrics.travel));
    const trackPosition = progress * (projectChapterCards.length - 1);
    const activeCard = projectChapterCards[Math.round(trackPosition)] ?? projectChapterCards[0];
    projectTrack.style.transform = `translate3d(${-trackPosition * projectList.clientWidth}px, 0, 0)`;
    setActiveProjectChapter(activeCard);
    setProjectDeckAccessibility(activeCard);
    return;
  }

  const readingLine = window.innerHeight * 0.48;
  const activeCard = projectChapterCards.find((card) => {
    const bounds = card.getBoundingClientRect();
    return bounds.top <= readingLine && bounds.bottom >= readingLine;
  });

  if (!activeCard) {
    return;
  }
  setActiveProjectChapter(activeCard);

  const cardStorySteps = projectStorySteps
    .filter((step) => step.closest(".project-card") === activeCard);
  if (!cardStorySteps.length) {
    return;
  }

  const activeStory = cardStorySteps.reduce((closest, step) => {
    const viewportCenter = window.innerHeight / 2;
    const bounds = step.getBoundingClientRect();
    const closestBounds = closest.getBoundingClientRect();
    const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
    const closestDistance = Math.abs(closestBounds.top + closestBounds.height / 2 - viewportCenter);
    return distance < closestDistance ? step : closest;
  }, cardStorySteps[0]);

  projectStorySteps.forEach((step) => {
    step.classList.toggle("is-active", step === activeStory);
  });

  const matchingViewerTab = document.getElementById(activeStory.dataset.projectView);
  if (matchingViewerTab instanceof HTMLButtonElement && matchingViewerTab.getAttribute("aria-selected") !== "true") {
    matchingViewerTab.click();
  }
};
const scheduleProjectTourUpdate = () => {
  if (projectTourFrame) {
    return;
  }
  projectTourFrame = window.requestAnimationFrame(updateProjectTour);
};

if (projectChapterCards.length) {
  const initialProject = projectChapterCards.find((card) => card.id === window.location.hash.slice(1))
    ?? projectChapterCards[0];
  setActiveProjectChapter(initialProject);
  const syncAndPositionProjectDeck = () => {
    syncProjectDeckMode();
    if (projectDeckEnabled && window.location.hash.startsWith("#project-")) {
      const hashProject = projectChapterCards.find((card) => card.id === window.location.hash.slice(1));
      if (hashProject) {
        goToProjectChapter(hashProject, "auto");
      }
    }
    scheduleProjectTourUpdate();
  };
  const positionHashProject = () => {
    if (!projectDeckEnabled || !window.location.hash.startsWith("#project-")) {
      return;
    }
    const hashProject = projectChapterCards.find((card) => card.id === window.location.hash.slice(1));
    if (!hashProject) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (projectList) projectList.scrollLeft = 0;
      goToProjectChapter(hashProject, "auto");
      scheduleProjectTourUpdate();
    });
  };
  window.addEventListener("scroll", scheduleProjectTourUpdate, { passive: true });
  window.addEventListener("resize", syncAndPositionProjectDeck);
  window.addEventListener("motionpreferencechange", syncAndPositionProjectDeck);
  window.addEventListener("load", positionHashProject, { once: true });
  window.addEventListener("hashchange", positionHashProject);
  window.addEventListener("popstate", () => {
    const hashProject = projectChapterCards.find((card) => card.id === window.location.hash.slice(1));
    if (hashProject && projectDeckEnabled) {
      goToProjectChapter(hashProject);
    }
  });
  reducedMotion.addEventListener?.("change", syncAndPositionProjectDeck);
  syncAndPositionProjectDeck();
  scheduleProjectTourUpdate();
}

const moreWorkSection = document.querySelector("[data-more-work]");
const moreWorkRun = moreWorkSection?.querySelector("[data-more-work-run]");
const moreWorkPin = moreWorkSection?.querySelector("[data-more-work-pin]");
const moreWorkFrameElement = moreWorkSection?.querySelector("[data-more-work-frame]");
const moreWorkTrack = moreWorkSection?.querySelector("[data-more-work-track]");
const moreWorkItems = Array.from(moreWorkSection?.querySelectorAll("[data-more-work-item]") ?? []);
const moreWorkControls = moreWorkSection?.querySelector("[data-more-work-controls]");
const moreWorkViewButtons = Array.from(moreWorkSection?.querySelectorAll("[data-more-work-view]") ?? []);
const moreWorkCount = moreWorkSection?.querySelector("[data-more-work-count]");
const moreWorkProgress = moreWorkSection?.querySelector("[data-more-work-progress]");
const moreWorkProgressTrack = moreWorkSection?.querySelector(".more-work-progress-track");
const moreWorkPrevious = moreWorkSection?.querySelector("[data-more-work-prev]");
const moreWorkNext = moreWorkSection?.querySelector("[data-more-work-next]");
let moreWorkView = "rail";
let moreWorkPinned = false;
let moreWorkActiveIndex = 0;
let moreWorkFrame = 0;

const getMoreWorkMetrics = () => {
  if (!moreWorkRun || !moreWorkPin || !moreWorkFrameElement || !moreWorkTrack) {
    return null;
  }

  const pinTop = Number.parseFloat(getComputedStyle(moreWorkPin).top) || 0;
  const runBounds = moreWorkRun.getBoundingClientRect();
  const travel = Math.max(1, moreWorkRun.offsetHeight - moreWorkPin.offsetHeight);
  const horizontalTravel = Math.max(0, moreWorkTrack.scrollWidth - moreWorkFrameElement.clientWidth);
  return {
    start: window.scrollY + runBounds.top - pinTop,
    travel,
    horizontalTravel,
  };
};

const setMoreWorkActive = (index, progress) => {
  if (!moreWorkItems.length) {
    return;
  }

  const boundedIndex = Math.min(moreWorkItems.length - 1, Math.max(0, index));
  moreWorkActiveIndex = boundedIndex;
  moreWorkItems.forEach((item, itemIndex) => {
    const isCurrent = itemIndex === boundedIndex;
    item.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      item.setAttribute("aria-current", "step");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (moreWorkCount) {
    moreWorkCount.textContent = String(boundedIndex + 1).padStart(2, "0");
  }
  if (moreWorkProgress) {
    const visibleProgress = Math.max(1 / moreWorkItems.length, Math.min(1, progress));
    moreWorkProgress.style.transform = `scaleX(${visibleProgress})`;
  }
  if (moreWorkProgressTrack) {
    moreWorkProgressTrack.setAttribute("aria-valuenow", String(boundedIndex + 1));
    const title = moreWorkItems[boundedIndex].querySelector("h4")?.textContent.trim() ?? "Project";
    moreWorkProgressTrack.setAttribute("aria-valuetext", `${boundedIndex + 1} of ${moreWorkItems.length}: ${title}`);
  }
  if (moreWorkPrevious) {
    moreWorkPrevious.disabled = boundedIndex === 0;
  }
  if (moreWorkNext) {
    moreWorkNext.disabled = boundedIndex === moreWorkItems.length - 1;
  }
};

const getMoreWorkStart = () => {
  if (!moreWorkRun || !moreWorkPin) {
    return 0;
  }
  const pinTop = Number.parseFloat(getComputedStyle(moreWorkPin).top) || 0;
  return window.scrollY + moreWorkRun.getBoundingClientRect().top - pinTop;
};

const syncMoreWorkMode = () => {
  if (!moreWorkSection || !moreWorkRun || !moreWorkPin || !moreWorkTrack || !moreWorkFrameElement) {
    return;
  }

  const wasPinned = moreWorkPinned;
  const oldStart = wasPinned ? getMoreWorkStart() : 0;
  const shouldPin = Boolean(
    moreWorkView === "rail"
    && moreWorkItems.length > 1
    && window.matchMedia("(min-width: 1081px) and (min-height: 740px)").matches
    && document.documentElement.classList.contains("motion-enabled")
    && !reducedMotion.matches,
  );

  if (wasPinned && !shouldPin) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0;
    const listStart = window.scrollY + moreWorkSection.getBoundingClientRect().top - headerHeight - 16;
    const targetScroll = moreWorkView === "list" ? listStart : oldStart;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: Math.max(0, targetScroll), behavior: "auto" });
    root.style.scrollBehavior = previousScrollBehavior;
  }

  moreWorkSection.classList.toggle("is-list-view", moreWorkView === "list");
  moreWorkTrack.classList.toggle("is-list", moreWorkView === "list");
  moreWorkTrack.classList.toggle("is-rail", moreWorkView === "rail");
  moreWorkRun.classList.toggle("is-scroll-pinned", shouldPin);
  moreWorkPin.classList.toggle("is-scroll-pinned", shouldPin);
  moreWorkPinned = shouldPin;

  if (shouldPin) {
    moreWorkFrameElement.scrollLeft = 0;
    moreWorkTrack.style.removeProperty("transform");
    const horizontalTravel = Math.max(0, moreWorkTrack.scrollWidth - moreWorkFrameElement.clientWidth);
    moreWorkRun.style.height = `${moreWorkPin.offsetHeight + horizontalTravel}px`;
  } else {
    moreWorkRun.style.removeProperty("height");
    moreWorkTrack.style.removeProperty("transform");
    if (moreWorkView === "rail") {
      moreWorkFrameElement.scrollLeft = 0;
    }
  }

  scheduleMoreWorkUpdate();
};

const updateMoreWork = () => {
  moreWorkFrame = 0;
  if (!moreWorkTrack || !moreWorkFrameElement || moreWorkItems.length === 0) {
    return;
  }

  if (moreWorkPinned) {
    const metrics = getMoreWorkMetrics();
    if (!metrics) {
      return;
    }
    const progress = Math.min(1, Math.max(0, (window.scrollY - metrics.start) / metrics.travel));
    const activeIndex = Math.round(progress * (moreWorkItems.length - 1));
    moreWorkTrack.style.transform = `translate3d(${-metrics.horizontalTravel * progress}px, 0, 0)`;
    setMoreWorkActive(activeIndex, progress);
    return;
  }

  if (moreWorkView === "rail") {
    const maxScroll = Math.max(1, moreWorkTrack.scrollWidth - moreWorkFrameElement.clientWidth);
    const progress = Math.min(1, Math.max(0, moreWorkFrameElement.scrollLeft / maxScroll));
    setMoreWorkActive(Math.round(progress * (moreWorkItems.length - 1)), progress);
  } else {
    setMoreWorkActive(moreWorkActiveIndex, (moreWorkActiveIndex + 1) / moreWorkItems.length);
  }
};

function scheduleMoreWorkUpdate() {
  if (!moreWorkFrame) {
    moreWorkFrame = window.requestAnimationFrame(updateMoreWork);
  }
}

const setMoreWorkView = (view) => {
  if (!moreWorkSection || !["rail", "list"].includes(view) || view === moreWorkView) {
    return;
  }

  moreWorkView = view;
  moreWorkViewButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.moreWorkView === view));
  });
  if (moreWorkControls) {
    moreWorkControls.hidden = false;
  }
  syncMoreWorkMode();
};

if (moreWorkSection && moreWorkRun && moreWorkPin && moreWorkTrack && moreWorkFrameElement && moreWorkItems.length) {
  if (moreWorkControls) {
    moreWorkControls.hidden = false;
  }

  moreWorkViewButtons.forEach((button) => {
    button.addEventListener("click", () => setMoreWorkView(button.dataset.moreWorkView));
  });

  const moveMoreWorkTo = (targetIndex) => {
    const boundedIndex = Math.min(moreWorkItems.length - 1, Math.max(0, targetIndex));
    if (moreWorkPinned && moreWorkItems.length > 1) {
      const metrics = getMoreWorkMetrics();
      if (metrics) {
        const progress = boundedIndex / (moreWorkItems.length - 1);
        window.scrollTo({
          top: metrics.start + metrics.travel * progress,
          behavior: document.documentElement.classList.contains("motion-enabled") && !reducedMotion.matches ? "smooth" : "auto",
        });
      }
      return;
    }

    if (moreWorkView === "rail") {
      const targetItem = moreWorkItems[boundedIndex];
      const left = Math.max(0, targetItem.offsetLeft - moreWorkTrack.offsetLeft);
      moreWorkFrameElement.scrollTo({
        left,
        behavior: document.documentElement.classList.contains("motion-enabled") && !reducedMotion.matches ? "smooth" : "auto",
      });
    }
  };

  moreWorkPrevious?.addEventListener("click", () => moveMoreWorkTo(moreWorkActiveIndex - 1));
  moreWorkNext?.addEventListener("click", () => moveMoreWorkTo(moreWorkActiveIndex + 1));
  moreWorkFrameElement.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || moreWorkView !== "rail") {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveMoreWorkTo(moreWorkActiveIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveMoreWorkTo(moreWorkActiveIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveMoreWorkTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveMoreWorkTo(moreWorkItems.length - 1);
    }
  });
  moreWorkFrameElement.addEventListener("scroll", scheduleMoreWorkUpdate, { passive: true });
  window.addEventListener("scroll", scheduleMoreWorkUpdate, { passive: true });
  window.addEventListener("resize", syncMoreWorkMode);
  window.addEventListener("motionpreferencechange", syncMoreWorkMode);
  reducedMotion.addEventListener?.("change", syncMoreWorkMode);
  syncMoreWorkMode();
  setMoreWorkActive(0, 1 / moreWorkItems.length);
}

const mobileNavMenu = document.querySelector(".mobile-nav-more");
const mobileNavSummary = mobileNavMenu?.querySelector("summary");

if (mobileNavMenu && mobileNavSummary) {
  mobileNavMenu.querySelectorAll(".mobile-nav-panel a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNavMenu.open = false;
    });
  });

  mobileNavMenu.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNavMenu.open) {
      mobileNavMenu.open = false;
      mobileNavSummary.focus();
    }
  });
}

const sectionNavLinks = document.querySelectorAll(
  '.main-nav a[href^="#"], .mobile-nav-panel a[href^="#"]',
);
const sectionLinksByTarget = new Map();

sectionNavLinks.forEach((link) => {
  const target = document.querySelector(link.getAttribute("href"));
  if (target instanceof HTMLElement) {
    const targetLinks = sectionLinksByTarget.get(target) ?? [];
    targetLinks.push(link);
    sectionLinksByTarget.set(target, targetLinks);
  }
});

if (sectionLinksByTarget.size > 0) {
  const updateActiveSection = () => {
    const readingLine = window.innerHeight * 0.32;
    const activeSection = Array.from(sectionLinksByTarget.keys())
      .find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= readingLine && bounds.bottom > readingLine;
      });

    sectionLinksByTarget.forEach((links, section) => {
      links.forEach((link) => {
        if (section === activeSection) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  };

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();
}

let progressFrame = 0;
const updatePageProgress = () => {
  if (progressFrame) {
    return;
  }

  progressFrame = window.requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;
    document.documentElement.style.setProperty("--page-progress", String(progress));
    progressFrame = 0;
  });
};

window.addEventListener("scroll", updatePageProgress, { passive: true });
window.addEventListener("resize", updatePageProgress);
updatePageProgress();

const projectVisuals = document.querySelectorAll(".project-visual");
if (projectVisuals.length && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  projectVisuals.forEach((visual) => {
    const resetVisual = () => {
      visual.classList.remove("is-spotlit");
      visual.style.setProperty("--visual-pointer-x", "50%");
      visual.style.setProperty("--visual-pointer-y", "50%");
      visual.style.setProperty("--visual-tilt-x", "0deg");
      visual.style.setProperty("--visual-tilt-y", "0deg");
    };

    visual.addEventListener("pointermove", (event) => {
      if (!document.documentElement.classList.contains("motion-enabled")) {
        return;
      }

      const bounds = visual.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      visual.classList.add("is-spotlit");
      visual.style.setProperty("--visual-pointer-x", `${(x * 100).toFixed(1)}%`);
      visual.style.setProperty("--visual-pointer-y", `${(y * 100).toFixed(1)}%`);
      visual.style.setProperty("--visual-tilt-x", `${((0.5 - y) * 4).toFixed(2)}deg`);
      visual.style.setProperty("--visual-tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
    });

    visual.addEventListener("pointerleave", resetVisual);
  });
}

const projectViewers = document.querySelectorAll("[data-viewer]");
projectViewers.forEach((viewer) => {
  const tabs = Array.from(viewer.querySelectorAll('[role="tab"]'));
  const activateViewerTab = (tab, focus = false) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = viewer.querySelector(`#${item.getAttribute("aria-controls")}`);
      if (panel) {
        panel.hidden = !selected;
      }
    });
    if (tab.closest(".project-card") === activeProjectChapter) {
      updateProjectViewStatus(tab);
    }
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateViewerTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      activateViewerTab(tabs[nextIndex], true);
    });
  });
});

const caseHeroArts = document.querySelectorAll(".case-hero-art");
if (caseHeroArts.length && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  caseHeroArts.forEach((art) => {
    const resetCaseArt = () => {
      art.style.setProperty("--case-tilt-x", "0deg");
      art.style.setProperty("--case-tilt-y", "0deg");
      art.style.setProperty("--case-light-x", "50%");
      art.style.setProperty("--case-light-y", "50%");
    };

    art.addEventListener("pointermove", (event) => {
      if (!document.documentElement.classList.contains("motion-enabled")) {
        return;
      }

      const bounds = art.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      art.style.setProperty("--case-tilt-x", `${((0.5 - y) * 2.4).toFixed(2)}deg`);
      art.style.setProperty("--case-tilt-y", `${((x - 0.5) * 3.2).toFixed(2)}deg`);
      art.style.setProperty("--case-light-x", `${(x * 100).toFixed(1)}%`);
      art.style.setProperty("--case-light-y", `${(y * 100).toFixed(1)}%`);
    });

    art.addEventListener("pointerleave", resetCaseArt);
  });
}

const productSteps = Array.from(document.querySelectorAll(".process-step[data-product-step]"));
const traceLinks = Array.from(document.querySelectorAll("[data-trace-stage]"));
const architectureNodes = Array.from(document.querySelectorAll("[data-architecture-node]"));
const architectureMap = document.querySelector(".architecture-map");
const traceSequence = document.querySelector(".trace-sequence");
const traceReadoutLabel = document.querySelector("#trace-readout-label");
const traceReadoutCopy = document.querySelector("#trace-readout-copy");
if (productSteps.length > 0 && traceLinks.length > 0 && traceSequence && traceReadoutLabel && traceReadoutCopy) {
  const activateProductStep = (step) => {
    const activeIndex = Number(step.dataset.productStep);
    productSteps.forEach((item) => item.classList.toggle("is-active", item === step));
    traceLinks.forEach((link) => {
      if (Number(link.dataset.traceStage) === activeIndex) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    architectureNodes.forEach((node) => {
      const isActive = Number(node.dataset.architectureNode) === activeIndex;
      node.classList.toggle("is-active", isActive);
      if (isActive) {
        node.setAttribute("aria-current", "step");
      } else {
        node.removeAttribute("aria-current");
      }
    });
    architectureMap?.style.setProperty(
      "--architecture-progress",
      `${(activeIndex / Math.max(productSteps.length - 1, 1)) * 100}%`,
    );
    traceSequence.style.setProperty(
      "--trace-ratio",
      String(activeIndex / Math.max(productSteps.length - 1, 1)),
    );
    traceReadoutLabel.textContent = `ACTIVE PHASE · ${String(activeIndex + 1).padStart(2, "0")}`;
    traceReadoutCopy.textContent = step.dataset.traceSummary ?? "Move through the steps to see the product path.";
  };

  const initialStep = productSteps.find((step) => step.id === window.location.hash.slice(1)) ?? productSteps[0];
  activateProductStep(initialStep);

  traceLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.slice(1);
      const targetStep = productSteps.find((step) => step.id === targetId);
      if (targetStep) {
        activateProductStep(targetStep);
      }
    });
  });

  architectureNodes.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.slice(1);
      const targetStep = productSteps.find((step) => step.id === targetId);
      if (targetStep) {
        activateProductStep(targetStep);
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const productStepObserver = new IntersectionObserver((entries) => {
      const visibleSteps = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => {
          const viewportCenter = window.innerHeight / 2;
          const firstCenter = first.boundingClientRect.top + first.boundingClientRect.height / 2;
          const secondCenter = second.boundingClientRect.top + second.boundingClientRect.height / 2;
          return Math.abs(firstCenter - viewportCenter) - Math.abs(secondCenter - viewportCenter);
        });

      if (visibleSteps[0]) {
        activateProductStep(visibleSteps[0].target);
      }
    }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });

    productSteps.forEach((step) => productStepObserver.observe(step));
  }
}

if ("IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".hero-copy, .hero-guide-stage, .intro-layout > *, .proof-inner > p, .section-heading, .work-tour-guide, .project-card, .expertise-card, .process-list li, .timeline-entry, .education-card, .recognition-items > p, .case-hero-art, .case-meta-grid, .case-flow .flow-step, .case-article section",
  );

  revealTargets.forEach((target) => target.classList.add("reveal-item"));
  document.body.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const caseSections = document.querySelectorAll(".case-article section[id]");
const caseLinks = document.querySelectorAll("[data-case-link]");
const caseProgressCount = document.querySelector("[data-case-progress-count]");
const caseProgressFill = document.querySelector("[data-case-progress-fill]");

if (caseSections.length > 0 && caseLinks.length > 0 && "IntersectionObserver" in window) {
  const linkBySection = new Map(
    Array.from(caseLinks, (link) => [link.getAttribute("href")?.slice(1), link]),
  );
  const visibleSections = new Set();

  const caseSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.add(entry.target);
      } else {
        visibleSections.delete(entry.target);
      }
    });
    const activeSection = Array.from(visibleSections)
      .sort((first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top)[0];
    const activeLink = activeSection
      ? linkBySection.get(activeSection.id)
      : undefined;

    if (activeLink) {
      caseLinks.forEach((link) => {
        if (link === activeLink) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      if (caseProgressCount && caseProgressFill) {
        const activeIndex = Array.from(caseSections).indexOf(activeSection);
        caseProgressCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(caseSections.length).padStart(2, "0")}`;
        caseProgressFill.style.width = `${((activeIndex + 1) / caseSections.length) * 100}%`;
      }
    }
  }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });

  caseSections.forEach((section) => caseSectionObserver.observe(section));
}

const networkPath = document.querySelector("[data-network-path]");
if (networkPath) {
  const networkStages = Array.from(networkPath.querySelectorAll("[data-network-path-stage]"));
  const networkLinks = Array.from(networkPath.querySelectorAll("[data-network-path-link]"));
  const networkCount = networkPath.querySelector("[data-network-path-count]");
  const networkReadout = networkPath.querySelector("[data-network-path-readout]");
  let networkPathFrame = 0;

  const activateNetworkStage = (stage) => {
    const activeIndex = Number(stage.dataset.networkPathStage);
    networkPath.style.setProperty(
      "--network-path-progress",
      `${(activeIndex / Math.max(networkStages.length - 1, 1)) * 100}%`,
    );
    networkStages.forEach((item) => item.classList.toggle("is-active", item === stage));
    networkLinks.forEach((link) => {
      if (Number(link.dataset.networkPathLink) === activeIndex) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (networkCount) {
      networkCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(networkStages.length).padStart(2, "0")}`;
    }
    if (networkReadout) {
      networkReadout.textContent = stage.dataset.networkPathSummary ?? "Follow the work from source data to service delivery.";
    }
  };

  networkLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetStage = networkStages.find(
        (stage) => Number(stage.dataset.networkPathStage) === Number(link.dataset.networkPathLink),
      );
      if (targetStage) {
        activateNetworkStage(targetStage);
      }
    });
  });

  if (networkStages[0]) {
    activateNetworkStage(networkStages[0]);
  }

  const updateNetworkPath = () => {
    networkPathFrame = 0;
    const viewportCenter = window.innerHeight / 2;
    const activeStage = networkStages.reduce((closest, stage) => {
      const bounds = stage.getBoundingClientRect();
      const closestBounds = closest.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
      const closestDistance = Math.abs(closestBounds.top + closestBounds.height / 2 - viewportCenter);
      return distance < closestDistance ? stage : closest;
    }, networkStages[0]);
    if (activeStage) {
      activateNetworkStage(activeStage);
    }
  };
  const scheduleNetworkPathUpdate = () => {
    if (!networkPathFrame) {
      networkPathFrame = window.requestAnimationFrame(updateNetworkPath);
    }
  };

  window.addEventListener("scroll", scheduleNetworkPathUpdate, { passive: true });
  window.addEventListener("resize", scheduleNetworkPathUpdate);
  scheduleNetworkPathUpdate();
}

const docsStack = document.querySelector("[data-docs-stack]");
if (docsStack) {
  const docsSteps = Array.from(docsStack.querySelectorAll("[data-docs-stack-step]"));
  const docsLayerLinks = Array.from(docsStack.querySelectorAll("[data-docs-layer-link]"));
  const docsLayerCount = docsStack.querySelector("[data-docs-layer-count]");
  const docsStackReadout = docsStack.querySelector("[data-docs-stack-readout]");
  const docsStackState = docsStack.querySelector("[data-docs-stack-state]");
  const docsStackVisual = docsStack.querySelector(".docs-stack-visual");
  let docsStackFrame = 0;

  const activateDocsStep = (step, openProgress = 0) => {
    const activeIndex = Number(step.dataset.docsStackStep);
    const stillMode = reducedMotion.matches || !document.documentElement.classList.contains("motion-enabled");
    const visibleOpenProgress = stillMode ? 1 : openProgress;
    const mobileLayout = window.matchMedia("(max-width: 680px)").matches;
    const mobileDocked = mobileLayout && window.innerHeight > 760;
    const shortViewport = !mobileLayout && window.innerHeight <= 780;
    const closedSpacing = mobileLayout ? 7 : 9;
    const openSpacing = mobileLayout
      ? (mobileDocked ? 64 : 80)
      : shortViewport
        ? (window.innerHeight <= 580 ? 52 : 74)
        : 132;
    const sequenceProgress = visibleOpenProgress * docsLayerLinks.length;

    docsStack.style.setProperty(
      "--docs-stack-progress",
      `${openProgress * 100}%`,
    );
    docsStack.style.setProperty("--docs-stack-open", String(visibleOpenProgress));
    docsLayerLinks.forEach((link, index) => {
      const offset = index - ((docsLayerLinks.length - 1) / 2);
      const layerProgress = Math.min(1, Math.max(0, sequenceProgress - index));
      const layerMotionProgress = 1 - ((1 - layerProgress) ** 3);
      const layerSpacing = closedSpacing + ((openSpacing - closedSpacing) * layerMotionProgress);
      link.style.setProperty("--docs-layer-progress", String(layerProgress));
      link.style.setProperty("--docs-layer-opacity", index > activeIndex && layerProgress === 0 ? "0.3" : "1");
      link.style.setProperty("--docs-layer-y", `${offset * layerSpacing}px`);
      link.style.setProperty("--docs-layer-x", `${offset * layerMotionProgress * 4}px`);
      link.style.setProperty("--docs-layer-z", `${(-offset * (6 + (layerMotionProgress * 5))) + (layerMotionProgress * 4)}px`);
      link.style.setProperty("--docs-layer-tilt", `${offset * layerMotionProgress * -1.25}deg`);
    });
    docsSteps.forEach((item) => item.classList.toggle("is-active", item === step));
    docsLayerLinks.forEach((link) => {
      if (Number(link.dataset.docsLayerLink) === activeIndex) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (docsLayerCount) {
      docsLayerCount.textContent = `LAYER ${String(activeIndex + 1).padStart(2, "0")} / ${String(docsSteps.length).padStart(2, "0")}`;
    }
    if (docsStackReadout) {
      docsStackReadout.textContent = step.dataset.docsStackSummary ?? "Explore the capabilities behind document intelligence.";
    }
    if (docsStackState && docsStackVisual) {
      const phase = visibleOpenProgress < 0.03 ? "assembled" : visibleOpenProgress > 0.98 ? "open" : "opening";
      docsStackVisual.dataset.stackPhase = phase;
      docsStackState.textContent = phase === "assembled"
        ? "ASSEMBLED VIEW"
        : phase === "open"
          ? "LAYERS OPEN"
          : "OPENING LAYERS";
    }
  };

  docsLayerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetStep = docsSteps.find(
        (step) => Number(step.dataset.docsStackStep) === Number(link.dataset.docsLayerLink),
      );
      if (targetStep) {
        activateDocsStep(targetStep);
      }
    });
  });

  const updateDocsStack = () => {
    docsStackFrame = 0;
    if (!docsSteps.length) {
      return;
    }
    const mobileDocked = window.matchMedia("(max-width: 680px)").matches && window.innerHeight > 760;
    const viewportCenter = mobileDocked
      ? (window.innerHeight - 490 + 72) / 2
      : window.innerHeight / 2;
    const stepCenters = docsSteps.map((step) => {
      const bounds = step.getBoundingClientRect();
      return bounds.top + (bounds.height / 2);
    });
    let openProgress = 0;
    if (viewportCenter >= stepCenters[stepCenters.length - 1]) {
      openProgress = 1;
    } else if (viewportCenter > stepCenters[0]) {
      const segmentIndex = stepCenters.findIndex((center, index) =>
        index < stepCenters.length - 1 && viewportCenter <= stepCenters[index + 1],
      );
      if (segmentIndex >= 0) {
        const segmentStart = stepCenters[segmentIndex];
        const segmentEnd = stepCenters[segmentIndex + 1];
        const segmentProgress = segmentEnd === segmentStart
          ? 0
          : (viewportCenter - segmentStart) / (segmentEnd - segmentStart);
        openProgress = (segmentIndex + segmentProgress) / (docsSteps.length - 1);
      }
    }
    openProgress = Math.min(1, Math.max(0, openProgress));
    const activeStep = docsSteps.reduce((closest, step) => {
      const bounds = step.getBoundingClientRect();
      const closestBounds = closest.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
      const closestDistance = Math.abs(closestBounds.top + closestBounds.height / 2 - viewportCenter);
      return distance < closestDistance ? step : closest;
    }, docsSteps[0]);
    activateDocsStep(activeStep, openProgress);
  };
  const scheduleDocsStackUpdate = () => {
    if (!docsStackFrame) {
      docsStackFrame = window.requestAnimationFrame(updateDocsStack);
    }
  };

  if (docsSteps[0]) {
    activateDocsStep(docsSteps[0]);
    window.addEventListener("scroll", scheduleDocsStackUpdate, { passive: true });
    window.addEventListener("resize", scheduleDocsStackUpdate);
    motionToggle?.addEventListener("click", scheduleDocsStackUpdate);
    scheduleDocsStackUpdate();
  }
}

const proofTabList = document.querySelector(".proof-explorer-tabs[role='tablist']");
if (proofTabList) {
  const proofTabs = Array.from(proofTabList.querySelectorAll("[role='tab']"));
  const proofPanels = proofTabs
    .map((tab) => document.getElementById(tab.getAttribute("aria-controls")))
    .filter(Boolean);

  const activateProofTab = (tab, moveFocus = false) => {
    proofTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) {
        item.focus();
      }
    });
    proofPanels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  };

  proofTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateProofTab(tab));
    tab.addEventListener("keydown", (event) => {
      const activeIndex = proofTabs.indexOf(tab);
      let nextIndex = activeIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (activeIndex + 1) % proofTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (activeIndex - 1 + proofTabs.length) % proofTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = proofTabs.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      activateProofTab(proofTabs[nextIndex], true);
    });
  });
}

const demoForm = document.querySelector("#demo-search");
const demoQuery = document.querySelector("#demo-query");
const demoResult = document.querySelector("#demo-result");

if (demoForm && demoQuery && demoResult) {
  const sampleDocuments = [
    {
      id: "incident-reporting",
      title: "Service continuity guide",
      section: "Incident reporting",
      text: "Report a service outage to the operations desk. Include the affected service, location, start time, and observed impact. The operations team records the incident and shares a reference number.",
      answer: "Report the outage to the operations desk with the affected service, location, start time, and observed impact. The team records it and shares a reference number.",
    },
    {
      id: "document-retention",
      title: "Records handling standard",
      section: "Document retention",
      text: "Working documents should be retained for 24 months after the work is completed. Legal holds and local regulations may require a different retention period; consult the records team.",
      answer: "The sample standard says working documents are retained for 24 months after completion, unless a legal hold or local regulation requires otherwise.",
    },
    {
      id: "access-management",
      title: "Access management procedure",
      section: "Access requests",
      text: "A user's manager approves an access request. System owners review requests for restricted resources. Access should be limited to what is needed for the user's role.",
      answer: "The user's manager approves an access request. For restricted resources, the system owner also reviews it.",
    },
  ];
  const stopWords = new Set(["a", "an", "and", "are", "do", "for", "how", "i", "is", "me", "of", "the", "to", "what", "who"]);

  const searchDocuments = (query) => {
    const terms = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const keywords = terms.filter((term) => !stopWords.has(term));
    if (keywords.length === 0) {
      return [];
    }

    return sampleDocuments
      .map((document) => {
        const searchableText = `${document.title} ${document.section} ${document.text}`.toLowerCase();
        const score = keywords.reduce((total, term) => total + (searchableText.includes(term) ? 1 : 0), 0);
        return { document, score };
      })
      .filter((result) => result.score > 0)
      .sort((first, second) => second.score - first.score);
  };

  const renderSearchResult = (query) => {
    const matches = searchDocuments(query);
    demoResult.replaceChildren();

    const label = document.createElement("span");
    label.className = "mono-label";
    label.textContent = "SYNTHETIC KNOWLEDGE BASE · LOCAL DEMO";
    demoResult.append(label);

    if (matches.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.textContent = "No matching sample source found. Try “service outage”, “retention period”, or “access request”.";
      demoResult.append(emptyState);
      return;
    }

    const resultLabel = document.createElement("span");
    resultLabel.className = "demo-answer-label";
    resultLabel.textContent = "SAMPLE RESPONSE";
    const answer = document.createElement("p");
    answer.className = "demo-answer";
    answer.textContent = matches[0].document.answer;
    const source = document.createElement("p");
    source.className = "demo-source";
    source.textContent = `Source: ${matches[0].document.title} / ${matches[0].document.section}`;
    demoResult.append(resultLabel, answer, source);
  };

  const renderSampleChecks = () => {
    const checks = [
      { query: "How do I report a service outage?", expected: "incident-reporting" },
      { query: "What is the document retention period?", expected: "document-retention" },
      { query: "Who approves an access request?", expected: "access-management" },
    ].map((testCase) => {
      const [topMatch] = searchDocuments(testCase.query);
      return {
        query: testCase.query,
        expected: sampleDocuments.find((document) => document.id === testCase.expected),
        actual: topMatch?.document,
        passed: topMatch?.document.id === testCase.expected,
      };
    });

    demoEvaluation.replaceChildren();
    demoEvaluation.hidden = false;

    const title = document.createElement("p");
    title.className = "demo-evaluation-title";
    const passedCount = checks.filter((check) => check.passed).length;
    title.textContent = `Fixed sample checks: ${passedCount}/${checks.length} matched the expected source`;
    demoEvaluation.append(title);

    const list = document.createElement("ul");
    list.className = "evaluation-list";
    checks.forEach((check) => {
      const item = document.createElement("li");
      const status = document.createElement("span");
      status.className = check.passed ? "evaluation-status passed" : "evaluation-status failed";
      status.textContent = check.passed ? "PASS" : "CHECK";
      const detail = document.createElement("span");
      detail.textContent = `${check.query} — ${check.actual?.title ?? "No matching source"} (expected: ${check.expected?.title ?? "unknown"})`;
      item.append(status, detail);
      list.append(item);
    });
    demoEvaluation.append(list);
  };

  const demoEvaluation = document.querySelector("#demo-evaluation");
  const runDemoChecks = document.querySelector("#run-demo-checks");

  if (demoEvaluation && runDemoChecks) {
    runDemoChecks.addEventListener("click", renderSampleChecks);
  }

  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    demoEvaluation?.setAttribute("hidden", "");
    renderSearchResult(demoQuery.value.trim());
  });

  document.querySelectorAll(".demo-prompts [data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      demoQuery.value = button.dataset.query ?? "";
      demoEvaluation?.setAttribute("hidden", "");
      renderSearchResult(demoQuery.value);
      demoQuery.focus();
    });
  });
}
