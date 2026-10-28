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

if (document.body?.classList.contains("jrp-landing")) {
  // On the jrp-landing redesign, kinetic motion is always active unless OS prefers-reduced-motion is set;
  // the navbar wave button ([data-sound-toggle]) controls the Web Audio sound synthesizer.
  if (!reducedMotion.matches) {
    document.documentElement.classList.add("motion-enabled");
  }
  reducedMotion.addEventListener?.("change", (event) => {
    document.documentElement.classList.toggle("motion-enabled", !event.matches);
  });
} else if (motionToggle) {
  const setMotionEnabled = (enabled, savePreference = false) => {
    document.documentElement.classList.toggle("motion-enabled", enabled);
    document.documentElement.classList.toggle(
      "motion-preference-set",
      savePreference || savedMotionPreference !== null,
    );
    motionToggle.setAttribute("aria-pressed", String(enabled));
    const motionLabel = motionToggle.querySelector("[data-motion-label]");
    if (motionLabel) {
      motionLabel.textContent = enabled ? "Motion on" : "Motion off";
    } else {
      motionToggle.textContent = enabled ? "Motion on" : "Motion off";
    }
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

const caseSections = document.querySelectorAll(".case-article section[id], .jrp-case-article .jrp-case-section[id]");
const caseLinks = document.querySelectorAll("[data-case-link], .jrp-case-nav__item");
const caseProgressCount = document.querySelector("[data-case-progress-count], [data-jrp-case-count]");
const caseProgressFill = document.querySelector("[data-case-progress-fill], [data-jrp-case-fill]");

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
        const isCurrent = link === activeLink;
        if (isCurrent) {
          link.setAttribute("aria-current", "location");
          link.classList.add("is-active");
        } else {
          link.removeAttribute("aria-current");
          link.classList.remove("is-active");
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

/* ==========================================================================
   JITHINRP-INSPIRED EDITORIAL KINETIC RUNTIME (body.jrp-landing)
   ========================================================================== */
if (document.body.classList.contains("jrp-landing")) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  if (urlSearchParams.has("lite")) {
    document.documentElement.classList.add("is-lite-mode");
  }

  const isMotionAllowed = () =>
    document.documentElement.classList.contains("motion-enabled")
    && !reducedMotion.matches
    && !document.documentElement.classList.contains("is-lite-mode");

  // 1. Navbar spacer sync, compact scroll state, active section link & signature draw
  const jrpNavbar = document.querySelector(".jrp-navbar");
  const jrpNavbarSpacer = document.querySelector(".jrp-navbar-spacer");
  const jrpSignature = document.querySelector(".jrp-signature");
  const jrpNavLinks = Array.from(document.querySelectorAll('.jrp-nav__links a[href^="#"], .jrp-navbar__link[href^="#"]'));

  const syncNavbarMetrics = () => {
    if (jrpNavbar && jrpNavbarSpacer) {
      jrpNavbarSpacer.style.height = `${jrpNavbar.offsetHeight}px`;
    }
  };

  const updateNavbarScrollState = () => {
    if (!jrpNavbar) return;
    jrpNavbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const triggerSignatureDraw = () => {
    if (!jrpSignature || !isMotionAllowed()) return;
    jrpSignature.classList.remove("is-drawing");
    void jrpSignature.offsetWidth;
    jrpSignature.classList.add("is-drawing");
  };

  if (jrpSignature) {
    window.setTimeout(triggerSignatureDraw, 180);
    jrpSignature.addEventListener("mouseenter", triggerSignatureDraw);
  }

  const jrpNavTargets = jrpNavLinks
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href") ?? "");
      return target instanceof HTMLElement ? { link, target } : null;
    })
    .filter(Boolean);

  const updateJrpActiveNav = () => {
    const probeLine = window.innerHeight * 0.34;
    let activeEntry = null;
    for (const entry of jrpNavTargets) {
      const rect = entry.target.getBoundingClientRect();
      if (rect.top <= probeLine && rect.bottom > probeLine) {
        activeEntry = entry;
        break;
      }
    }
    jrpNavTargets.forEach((entry) => {
      if (entry === activeEntry) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    });
  };

  syncNavbarMetrics();
  updateNavbarScrollState();
  updateJrpActiveNav();
  window.addEventListener("resize", syncNavbarMetrics);

  // 2. Right-edge reading progress bar + CSS scroll-timeline fallback
  const readingPctEl = document.querySelector("[data-reading-pct]");
  const readingFillEl = document.querySelector("[data-reading-fill]");
  const supportsScrollTimeline = Boolean(
    window.CSS?.supports?.("animation-timeline", "scroll()"),
  );

  const updateReadingProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
    if (readingPctEl) {
      readingPctEl.textContent = `${Math.round(ratio * 100)}%`;
    }
    if (readingFillEl && !supportsScrollTimeline) {
      readingFillEl.style.transform = `scaleY(${ratio})`;
    }
  };
  updateReadingProgress();

  // 3. Shared scroll velocity tracker for Hero Pixel Title & Marquee
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let scrollVelocity = 0;
  let scrollDirection = 1;

  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      const dy = window.scrollY - lastScrollY;
      const dt = Math.max(8, now - lastScrollTime);
      const instantVelocity = (dy / dt) * 16.67;
      scrollVelocity = Math.max(-42, Math.min(42, instantVelocity));
      if (Math.abs(dy) > 0.5) {
        scrollDirection = dy > 0 ? 1 : -1;
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;

      updateNavbarScrollState();
      updateJrpActiveNav();
      updateReadingProgress();
    },
    { passive: true },
  );

  // 4. Hero Pixel Title character splitting & interactive cursor/scroll kinetics
  const pixelTitle = document.querySelector("[data-pixel-title]");
  const heroSection = document.querySelector(".jrp-hero");
  const charSpans = [];

  if (pixelTitle) {
    const rawText = (pixelTitle.textContent ?? "").trim();
    pixelTitle.setAttribute("aria-label", rawText);
    pixelTitle.textContent = "";

    Array.from(rawText).forEach((ch) => {
      const span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      if (ch === " ") {
        span.className = "jrp-char jrp-char--space";
        span.textContent = "\u00A0";
      } else {
        span.className = "jrp-char";
        span.textContent = ch;
        charSpans.push(span);
      }
      pixelTitle.appendChild(span);
    });
  }

  let heroPointerX = -9999;
  let heroPointerY = -9999;
  let heroPointerActive = false;
  let heroInView = true;
  let smoothedSkew = 0;

  if (heroSection && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    heroSection.addEventListener("pointermove", (event) => {
      heroPointerX = event.clientX;
      heroPointerY = event.clientY;
      heroPointerActive = true;
    });
    heroSection.addEventListener("pointerleave", () => {
      heroPointerActive = false;
    });
  }

  if (heroSection && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroInView = entry.isIntersecting;
        });
      },
      { threshold: 0 },
    );
    heroObserver.observe(heroSection);
  }

  // 5. Scroll-velocity kinetic marquee setup
  const marqueeContainer = document.querySelector("[data-marquee]");
  const marqueeTrack = marqueeContainer?.querySelector(".jrp-marquee__track");
  let marqueeBaseWidth = 0;
  let marqueeOffset = 0;
  let marqueeSpeedBoost = 0;
  let marqueeSkew = 0;
  let marqueeInView = true;

  if (marqueeTrack) {
    const firstGroup = marqueeTrack.querySelector(".jrp-marquee__group");
    if (firstGroup) {
      // Clone enough groups to cover wide viewports seamlessly
      for (let i = 0; i < 2; i += 1) {
        const clone = firstGroup.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        marqueeTrack.appendChild(clone);
      }
      const measureMarquee = () => {
        marqueeBaseWidth = firstGroup.getBoundingClientRect().width;
      };
      measureMarquee();
      window.addEventListener("resize", measureMarquee);
    }
  }

  if (marqueeContainer && "IntersectionObserver" in window) {
    const marqueeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          marqueeInView = entry.isIntersecting;
        });
      },
      { threshold: 0 },
    );
    marqueeObserver.observe(marqueeContainer);
  }

  // Unified kinetic animation loop for Hero chars + Marquee
  const tickKineticScene = (now) => {
    const motionOn = isMotionAllowed();

    // Decay scroll velocity smoothly
    scrollVelocity *= 0.9;
    if (Math.abs(scrollVelocity) < 0.02) {
      scrollVelocity = 0;
    }

    if (motionOn && heroInView && charSpans.length > 0) {
      const targetSkew = Math.max(-7, Math.min(7, scrollVelocity * -0.22));
      smoothedSkew += (targetSkew - smoothedSkew) * 0.16;
      const timeSec = now * 0.001;
      let maxCharInfluence = 0;

      charSpans.forEach((span, index) => {
        const wave = Math.sin(timeSec * 2.1 - index * 0.38) * 2.2;
        let lift = wave;
        let scale = 1;
        let scaleY = 1;
        let charBlur = 0;

        if (heroPointerActive) {
          const rect = span.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.5;
          const dist = Math.hypot(heroPointerX - cx, heroPointerY - cy);
          const radius = 225;
          if (dist < radius) {
            const influence = (1 - dist / radius) ** 2;
            if (influence > maxCharInfluence) maxCharInfluence = influence;
            lift += influence * 11 - Math.sin(influence * Math.PI) * 14;
            scale += influence * 0.05;
            scaleY += influence * 0.24;
            charBlur = influence * 2.1;
          }
        }

        span.style.setProperty("--char-lift", `${lift.toFixed(2)}px`);
        span.style.setProperty("--char-scale", scale.toFixed(3));
        span.style.setProperty("--char-scale-y", scaleY.toFixed(3));
        span.style.setProperty("--char-blur", `${charBlur.toFixed(2)}px`);
        span.style.setProperty("--char-skew", `${smoothedSkew.toFixed(2)}deg`);
      });

      // Drive SVG #liquid-melt displacement on pointer hover when near top of hero
      const heroDisp = document.getElementById("liquid-melt-disp");
      const heroTurb = document.getElementById("liquid-melt-turb");
      if (pixelTitle && window.scrollY < 40) {
        const hoverMelt = maxCharInfluence * 22;
        pixelTitle.classList.toggle("is-melting", hoverMelt > 0.6);
        if (heroDisp) {
          heroDisp.setAttribute("scale", hoverMelt > 0.6 ? hoverMelt.toFixed(1) : "0");
        }
        if (heroTurb && hoverMelt > 0.6) {
          const fx = (0.014 + Math.sin(timeSec * 2.8) * 0.004).toFixed(4);
          const fy = (0.038 + maxCharInfluence * 0.025).toFixed(4);
          heroTurb.setAttribute("baseFrequency", `${fx} ${fy}`);
        }
      }
    } else if (!motionOn && charSpans.length > 0) {
      charSpans.forEach((span) => {
        span.style.setProperty("--char-lift", "0px");
        span.style.setProperty("--char-scale", "1");
        span.style.setProperty("--char-scale-y", "1");
        span.style.setProperty("--char-blur", "0px");
        span.style.setProperty("--char-skew", "0deg");
      });
    }

    if (motionOn && marqueeTrack && marqueeBaseWidth > 0 && marqueeInView) {
      const targetBoost = Math.abs(scrollVelocity) * 0.35;
      marqueeSpeedBoost += (targetBoost - marqueeSpeedBoost) * 0.14;
      const targetMarqueeSkew = Math.max(-6, Math.min(6, scrollVelocity * -0.18));
      marqueeSkew += (targetMarqueeSkew - marqueeSkew) * 0.15;

      const step = (0.75 + marqueeSpeedBoost) * scrollDirection;
      marqueeOffset -= step;
      if (marqueeOffset <= -marqueeBaseWidth) {
        marqueeOffset += marqueeBaseWidth;
      } else if (marqueeOffset > 0) {
        marqueeOffset -= marqueeBaseWidth;
      }
      marqueeTrack.style.setProperty("--marquee-skew", `${marqueeSkew.toFixed(2)}deg`);
      marqueeTrack.style.transform = `translate3d(${marqueeOffset.toFixed(2)}px, 0, 0) skewX(var(--marquee-skew, 0deg))`;
    }

    window.requestAnimationFrame(tickKineticScene);
  };
  window.requestAnimationFrame(tickKineticScene);

  // 6. Scroll-entry reveals, hairline drawing & monolith scale
  const revealNodes = document.querySelectorAll(
    "[data-reveal], .band, .jrp-pillar + .jrp-pillar, .jrp-work__mid, .jrp-step + .jrp-step, .jrp-quote + .jrp-quote, [data-story-media], .jrp-case-meta__item, .jrp-case-kpi__card, .jrp-case-section, .jrp-decision-card, .jrp-case-compare__card, .jrp-case-proj",
  );

  if ("IntersectionObserver" in window) {
    const jrpRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    revealNodes.forEach((node) => jrpRevealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-revealed"));
  }

  // Selected Works Monoliths (driven by the 60fps Ball Lens & Oval Fluid Scroll engine in section 16)
  const monolithCards = Array.from(document.querySelectorAll("[data-story-media]"));

  // 7. Gooey Floating Cursor Pill & Anchored Tool-Chip Liquid Drip Tooltip
  const cursorPillEl = document.querySelector("[data-cursor-pill-el]");
  const cursorPillLabel = cursorPillEl?.querySelector("[data-cursor-pill-label]");
  const cursorPillNote = cursorPillEl?.querySelector("[data-cursor-pill-note]");
  const liquidTipEl = document.querySelector("[data-liquid-tip]");
  const liquidTipName = liquidTipEl?.querySelector("[data-liquid-tip-name]");
  const liquidTipNote = liquidTipEl?.querySelector("[data-liquid-tip-note]");
  let isCursorPillActive = false;

  if (cursorPillEl && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let pillTargetX = 0;
    let pillTargetY = 0;
    let pillCurrentX = 0;
    let pillCurrentY = 0;
    let lastPointerX = 0;
    let pillSkew = 0;
    let pillVisible = false;
    let activePillHost = null;
    let activeTipChip = null;

    const positionAnchoredTip = (chip) => {
      if (!liquidTipEl) return false;
      const r = chip.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        hideAnchoredTip();
        return false;
      }
      const tipW = Math.max(180, liquidTipEl.offsetWidth || 210);
      const left = Math.max(16, Math.min(window.innerWidth - tipW - 16, r.left + r.width * 0.5 - tipW * 0.5));
      const dropX = r.left + r.width * 0.5 - left;
      liquidTipEl.style.transform = `translate3d(${left.toFixed(1)}px, ${(r.bottom + 10).toFixed(1)}px, 0)`;
      liquidTipEl.style.setProperty("--tip-x", `${dropX.toFixed(1)}px`);
      return true;
    };

    const getWorkShadeForElement = (el) => {
      const workRow = el?.closest?.(".jrp-work");
      if (!workRow) return "#1e1638";
      switch (workRow.id) {
        case "project-credit":
          return "#8f2912";
        case "project-documents":
          return "#1d318a";
        case "project-network":
          return "#0b5447";
        case "project-banking":
          return "#4a1b96";
        default:
          return "#1e1638";
      }
    };

    const showAnchoredTip = (chip) => {
      if (!liquidTipEl || !liquidTipName || !liquidTipNote) return;
      if (chip !== activeTipChip) {
        activeTipChip = chip;
        liquidTipName.textContent = chip.getAttribute("data-cursor-pill") ?? "";
        liquidTipNote.textContent = chip.getAttribute("data-cursor-note") ?? "";
        liquidTipEl.style.setProperty("--tip-bg", getWorkShadeForElement(chip));
      }
      if (positionAnchoredTip(chip)) {
        liquidTipEl.classList.add("is-open");
      }
    };

    const hideAnchoredTip = () => {
      if (!activeTipChip || !liquidTipEl) return;
      activeTipChip = null;
      liquidTipEl.classList.remove("is-open");
    };

    const renderPillContent = (host) => {
      const label = host.getAttribute("data-cursor-pill") ?? "";
      const note = host.getAttribute("data-cursor-note");
      if (cursorPillLabel) {
        cursorPillLabel.textContent = label;
      }
      if (cursorPillNote) {
        cursorPillNote.textContent = note ?? "";
      }
      cursorPillEl.style.setProperty("--pill-bg", getWorkShadeForElement(host));
      cursorPillEl.classList.toggle("has-note", Boolean(note));
      cursorPillEl.classList.toggle("jrp-cursor-pill--note", Boolean(note));
    };

    document.addEventListener("pointermove", (event) => {
      const dx = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      pillSkew = Math.max(-10, Math.min(10, -dx * 0.48));

      const flipLeft = event.clientX + 210 > window.innerWidth;
      pillTargetX = flipLeft ? event.clientX - 18 : event.clientX + 18;
      pillTargetY = event.clientY + 18;
      cursorPillEl.style.setProperty("--pill-drop-x", flipLeft ? "calc(100% - 16px)" : "16px");

      const targetEl = event.target instanceof Element ? event.target : null;
      const toolChip = targetEl?.closest(".jrp-tool[data-cursor-note]");
      if (toolChip) {
        if (pillVisible) {
          pillVisible = false;
          isCursorPillActive = false;
          activePillHost = null;
          cursorPillEl.classList.remove("is-visible");
        }
        showAnchoredTip(toolChip);
        return;
      }
      hideAnchoredTip();

      const overTabList = targetEl?.closest(".viewer-tabs");
      const host = overTabList ? null : targetEl?.closest("[data-cursor-pill]");

      if (host) {
        if (!pillVisible) {
          pillCurrentX = pillTargetX;
          pillCurrentY = pillTargetY;
        }
        if (host !== activePillHost) {
          activePillHost = host;
          renderPillContent(host);
        }
        pillVisible = true;
        isCursorPillActive = true;
        cursorPillEl.classList.add("is-visible");
      } else if (pillVisible) {
        pillVisible = false;
        isCursorPillActive = false;
        activePillHost = null;
        cursorPillEl.classList.remove("is-visible");
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (activeTipChip) {
          positionAnchoredTip(activeTipChip);
        }
      },
      { passive: true },
    );

    const tickCursorPill = () => {
      if (pillVisible) {
        pillCurrentX += (pillTargetX - pillCurrentX) * 0.24;
        pillCurrentY += (pillTargetY - pillCurrentY) * 0.24;
        pillSkew *= 0.82;
        const flipOffset = lastPointerX + 210 > window.innerWidth ? "-100%" : "0%";
        cursorPillEl.style.transform = `translate3d(${pillCurrentX.toFixed(1)}px, ${pillCurrentY.toFixed(1)}px, 0) translateX(${flipOffset}) skewX(${pillSkew.toFixed(2)}deg)`;
      }
      window.requestAnimationFrame(tickCursorPill);
    };
    window.requestAnimationFrame(tickCursorPill);
  }

  // 8. Horizontal Carousel Controls & Pointer Drag-to-Scroll
  const carousels = document.querySelectorAll("[data-carousel]");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".jrp-track");
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    if (!track) return;

    const updateCarouselButtons = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
      if (prevBtn instanceof HTMLButtonElement) {
        prevBtn.disabled = track.scrollLeft <= 2;
      }
      if (nextBtn instanceof HTMLButtonElement) {
        nextBtn.disabled = track.scrollLeft >= maxScroll;
      }
    };

    const getScrollStride = () => {
      const firstCard = track.firstElementChild;
      if (firstCard instanceof HTMLElement) {
        const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
        return firstCard.offsetWidth + gap;
      }
      return 456;
    };

    prevBtn?.addEventListener("click", () => {
      track.scrollBy({
        left: -getScrollStride(),
        behavior: isMotionAllowed() ? "smooth" : "auto",
      });
    });

    nextBtn?.addEventListener("click", () => {
      track.scrollBy({
        left: getScrollStride(),
        behavior: isMotionAllowed() ? "smooth" : "auto",
      });
    });

    track.addEventListener("scroll", updateCarouselButtons, { passive: true });
    window.addEventListener("resize", updateCarouselButtons);
    updateCarouselButtons();
  });

  // Pointer drag-to-scroll for all .jrp-track horizontal rails
  const draggableTracks = document.querySelectorAll(".jrp-track");
  draggableTracks.forEach((track) => {
    let isPointerDown = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      isPointerDown = true;
      didDrag = false;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
    });

    window.addEventListener("pointermove", (event) => {
      if (!isPointerDown) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 6) {
        didDrag = true;
        track.classList.add("is-dragging");
      }
      if (didDrag) {
        track.scrollLeft = startScrollLeft - dx;
      }
    });

    const endTrackDrag = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.classList.remove("is-dragging");
      if (didDrag) {
        window.setTimeout(() => {
          didDrag = false;
        }, 40);
      }
    };

    window.addEventListener("pointerup", endTrackDrag);
    window.addEventListener("pointercancel", endTrackDrag);

    track.addEventListener(
      "click",
      (event) => {
        if (didDrag) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true,
    );
  });

  // 9. Native <dialog> Modals with top-layer exit animation & light-dismiss fallbacks
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.("transition-behavior", "allow-discrete") || !document.body) {
      return false;
    }
    const probe = document.createElement("div");
    probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = "none";
    supportsDisplayTransition = getComputedStyle(probe).display === "block";
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.("overlay", "auto") && canTransitionDisplay());
  }

  async function closeTopLayer(dialog) {
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    if (!supportsTopLayerExit()) {
      dialog.setAttribute("data-closing", "");
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => window.setTimeout(resolve, 400)),
        ]);
      }
      if (!dialog.hasAttribute("data-closing")) return;
      dialog.removeAttribute("data-closing");
    }
    dialog.close();
  }

  const modalTriggers = document.querySelectorAll("[data-modal-open]");
  modalTriggers.forEach((trigger) => {
    const openTargetModal = () => {
      const modalId = trigger.getAttribute("data-modal-open");
      const dialog = modalId ? document.getElementById(modalId) : null;
      if (dialog instanceof HTMLDialogElement && !dialog.open) {
        dialog.removeAttribute("data-closing");
        dialog.showModal();
      }
    };

    trigger.addEventListener("click", (event) => {
      // Allow direct links inside the card footer to navigate normally
      const clickedLink = event.target instanceof Element ? event.target.closest("a") : null;
      if (clickedLink) return;
      openTargetModal();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        const focusedLink = event.target instanceof Element ? event.target.closest("a") : null;
        if (focusedLink) return;
        event.preventDefault();
        openTargetModal();
      }
    });
  });

  const jrpDialogs = document.querySelectorAll("dialog.jrp-modal");
  jrpDialogs.forEach((dialog) => {
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });

    dialog.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        closeTopLayer(dialog);
      });
    });
  });

  // Light-dismiss fallback for browsers without native dialog[closedby="any"]
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outsideDialog = (event, dialog) => {
      const r = dialog.getBoundingClientRect();
      return (
        event.clientX < r.left
        || event.clientX > r.right
        || event.clientY < r.top
        || event.clientY > r.bottom
      );
    };

    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (event) => {
        pressedOutside = outsideDialog(event, dialog);
      });
      dialog.addEventListener("pointerup", (event) => {
        if (pressedOutside && outsideDialog(event, dialog)) {
          closeTopLayer(dialog);
        }
      });
    }
  }

  // 10. Footer Live Kolkata Time & Back to Top
  const localTimeEl = document.querySelector("[data-local-time]");
  const updateLocalTime = () => {
    if (!localTimeEl) return;
    try {
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
      localTimeEl.textContent = `KOLKATA, ${formatted.toUpperCase()}`;
    } catch {
      localTimeEl.textContent = "KOLKATA, IST";
    }
  };
  updateLocalTime();
  window.setInterval(updateLocalTime, 15000);

  const backTopBtn = document.querySelector("[data-back-top]");
  backTopBtn?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: isMotionAllowed() ? "smooth" : "auto",
    });
  });

  // 11. Web Audio Liquid Sound Synthesizer & Ambient Lofi Engine (jithinrp.com style)
  const soundApi = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const soundBtn = document.querySelector("[data-sound-toggle]");
    const soundLabel = soundBtn?.querySelector("[data-sound-label]");
    const soundTipText = soundBtn?.querySelector("[data-sound-tip-text]");
    if (!AC) {
      return {
        drop: () => {},
        bubble: () => {},
        tick: () => {},
        pop: () => {},
        unpop: () => {},
      };
    }

    const STORAGE_KEY = "jrp:sound";
    let savedPref = null;
    try {
      savedPref = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      savedPref = null;
    }

    let enabled = savedPref !== "0";
    let ctx = null;
    let master = null;
    let dry = null;
    let ambientGain = null;
    let ambientTimer = 0;
    let chordIndex = 0;
    let unlocked = false;

    const rand = (a, b) => a + Math.random() * (b - a);

    const createImpulse = (audioCtx, seconds = 1.1, decay = 3.2) => {
      const length = Math.floor(audioCtx.sampleRate * seconds);
      const buffer = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
      for (let ch = 0; ch < 2; ch += 1) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < length; i += 1) {
          data[i] = (Math.random() * 2 - 1) * ((1 - i / length) ** decay);
        }
      }
      return buffer;
    };

    const ensureGraph = () => {
      if (ctx) return ctx;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = enabled ? 0.36 : 0.0001;

      dry = ctx.createBiquadFilter();
      dry.type = "lowpass";
      dry.frequency.value = 4200;

      const conv = ctx.createConvolver();
      conv.buffer = createImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.24;

      dry.connect(master);
      dry.connect(conv);
      conv.connect(wet);
      wet.connect(master);
      master.connect(ctx.destination);

      return ctx;
    };

    const playAmbientChord = () => {
      if (!enabled || !unlocked || !ctx || ctx.state !== "running" || document.hidden) return;
      // Warm lofi Rhodes-like chords (Fmaj9 -> Em7 -> Dm9 -> Cmaj9)
      const chords = [
        [174.61, 220.0, 261.63, 329.63, 392.0],
        [164.81, 196.0, 246.94, 293.66, 392.0],
        [146.83, 220.0, 261.63, 329.63, 349.23],
        [130.81, 196.0, 246.94, 293.66, 329.63],
      ];
      const notes = chords[chordIndex % chords.length];
      chordIndex += 1;

      const t0 = ctx.currentTime + 0.02;
      const dur = 3.8;
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(540, t0);
      padFilter.frequency.exponentialRampToValueAtTime(320, t0 + dur);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.0001, t0);
      padGain.gain.linearRampToValueAtTime(0.026, t0 + 0.65);
      padGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      padFilter.connect(padGain);
      padGain.connect(dry);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t0);
        // Subtle tape wow/flutter detune
        osc.detune.setValueAtTime(rand(-4, 4), t0);
        osc.connect(padFilter);
        osc.start(t0 + idx * 0.04);
        osc.stop(t0 + dur + 0.05);
      });
    };

    const startAmbientLoop = () => {
      if (ambientTimer) return;
      playAmbientChord();
      ambientTimer = window.setInterval(playAmbientChord, 4200);
    };

    const stopAmbientLoop = () => {
      if (ambientTimer) {
        window.clearInterval(ambientTimer);
        ambientTimer = 0;
      }
    };

    const syncUI = () => {
      if (!soundBtn) return;
      const isPlaying = enabled && unlocked;
      soundBtn.setAttribute("aria-pressed", String(enabled));
      soundBtn.setAttribute("aria-label", enabled ? "Mute sound" : "Unmute sound");
      if (soundLabel) {
        soundLabel.textContent = enabled ? "Sound on" : "Sound off";
      }
      if (soundTipText) {
        if (!unlocked && enabled) {
          soundTipText.textContent = "Click anywhere for sound";
        } else {
          soundTipText.textContent = enabled ? "Sound on · click to mute" : "Sound off · click to unmute";
        }
      }
      soundBtn.classList.toggle("is-nudge", Boolean(enabled && !unlocked));
      if (isPlaying) {
        startAmbientLoop();
      } else {
        stopAmbientLoop();
      }
    };

    const finalizeUnlock = (audioCtx, wasUnlocked, playSample) => {
      unlocked = audioCtx.state === "running";
      if (master && audioCtx) {
        master.gain.setTargetAtTime(enabled ? 0.36 : 0.0001, audioCtx.currentTime, 0.04);
      }
      syncUI();
      if (unlocked && !wasUnlocked && enabled && playSample) {
        drop();
      }
    };

    const unlock = (playSample = true) => {
      const audioCtx = ensureGraph();
      if (!audioCtx) return;
      const wasUnlocked = unlocked;
      if (audioCtx.state === "suspended") {
        audioCtx
          .resume()
          .then(() => finalizeUnlock(audioCtx, wasUnlocked, playSample))
          .catch(() => {});
      }
      finalizeUnlock(audioCtx, wasUnlocked, playSample);
    };

    const ready = () => {
      if (!enabled) return false;
      const audioCtx = ensureGraph();
      if (!audioCtx) return false;
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      if (audioCtx.state === "running") {
        unlocked = true;
        return true;
      }
      return false;
    };

    const drip = ({ f0 = 560, len = 0.14, level = 0.7, delay = 0, rise = 2.6, pan = 0 } = {}) => {
      if (!ready()) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const node = ctx.createStereoPanner ? ctx.createStereoPanner() : gain;
      if (node !== gain) {
        node.pan.value = pan;
        gain.connect(node);
      }
      node.connect(dry);

      osc.type = "sine";
      osc.frequency.setValueAtTime(f0 * 0.72, t0);
      osc.frequency.exponentialRampToValueAtTime(f0, t0 + 0.018);
      osc.frequency.exponentialRampToValueAtTime(f0 * rise, t0 + len * 0.45);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.92, t0 + len);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(level * 0.26, t0 + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + len);

      osc.connect(gain);
      osc.start(t0);
      osc.stop(t0 + len + 0.02);

      // Tiny filtered water splash transient
      const nLen = Math.floor(ctx.sampleRate * 0.02);
      const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      const nd = nBuf.getChannelData(0);
      for (let i = 0; i < nLen; i += 1) {
        nd[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = nBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f0 * 4;
      bp.Q.value = 1.2;
      const ng = ctx.createGain();
      ng.gain.value = level * 0.045;
      noise.connect(bp);
      bp.connect(ng);
      ng.connect(dry);
      noise.start(t0);
    };

    const drop = () => drip({ f0: rand(620, 820), len: 0.13, level: 0.54 });
    const bubble = () => {
      const f = rand(230, 290);
      drip({ f0: f, len: 0.24, level: 0.62, rise: 3.0 });
      drip({ f0: f * 1.7, len: 0.11, level: 0.28, delay: 0.085 });
    };
    const tick = () => drip({ f0: rand(1150, 1400), len: 0.07, level: 0.34, rise: 2.0 });

    const pop = () => {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      const cLen = Math.floor(ctx.sampleRate * 0.012);
      const cBuf = ctx.createBuffer(1, cLen, ctx.sampleRate);
      const cd = cBuf.getChannelData(0);
      for (let i = 0; i < cLen; i += 1) {
        cd[i] = (Math.random() * 2 - 1) * ((1 - i / cLen) ** 0.35);
      }
      const crack = ctx.createBufferSource();
      crack.buffer = cBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      const cg = ctx.createGain();
      cg.gain.value = 0.38;
      crack.connect(hp);
      hp.connect(cg);
      cg.connect(dry);
      crack.start(t0);

      const skin = ctx.createOscillator();
      const sg = ctx.createGain();
      skin.type = "sine";
      skin.frequency.setValueAtTime(980, t0);
      skin.frequency.exponentialRampToValueAtTime(140, t0 + 0.055);
      sg.gain.setValueAtTime(0.28, t0);
      sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
      skin.connect(sg);
      sg.connect(dry);
      skin.start(t0);
      skin.stop(t0 + 0.065);

      for (let i = 0; i < 9; i += 1) {
        drip({
          f0: rand(950, 2100),
          len: rand(0.05, 0.11),
          level: rand(0.18, 0.42),
          delay: 0.015 + i * 0.018 + rand(0, 0.018),
          rise: rand(1.9, 2.7),
          pan: rand(-0.75, 0.75),
        });
      }
    };

    const unpop = () => {
      if (!ready()) return;
      for (let i = 0; i < 7; i += 1) {
        drip({
          f0: rand(1600, 900) - i * 70,
          len: rand(0.06, 0.1),
          level: rand(0.16, 0.34),
          delay: i * 0.02 + rand(0, 0.012),
          rise: 1.5,
          pan: rand(-0.6, 0.6) * (1 - i / 8),
        });
      }
      drip({ f0: 260, len: 0.2, level: 0.5, delay: 0.14, rise: 1.8 });
    };

    const setSoundEnabled = (next) => {
      enabled = Boolean(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
      } catch {
        // Ignore storage errors
      }
      const audioCtx = ensureGraph();
      if (audioCtx && audioCtx.state === "suspended" && enabled) {
        audioCtx.resume().catch(() => {});
      }
      if (enabled) {
        unlocked = true;
      }
      if (master && audioCtx) {
        master.gain.setTargetAtTime(enabled ? 0.36 : 0.0001, audioCtx.currentTime, 0.03);
      }
      syncUI();
      if (enabled) {
        drop();
      }
    };

    // Unlock audio on user gestures until AudioContext is genuinely running
    const onFirstGesture = (event) => {
      if (unlocked && ctx && ctx.state === "running") {
        window.removeEventListener("pointerdown", onFirstGesture);
        window.removeEventListener("keydown", onFirstGesture);
        window.removeEventListener("touchend", onFirstGesture);
        return;
      }
      if (soundBtn && event.target instanceof Element && soundBtn.contains(event.target)) {
        return;
      }
      unlock(true);
    };
    window.addEventListener("pointerdown", onFirstGesture, { passive: true });
    window.addEventListener("keydown", onFirstGesture, { passive: true });
    window.addEventListener("touchend", onFirstGesture, { passive: true });

    soundBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!unlocked && enabled) {
        // First click directly on the sound button when locked -> unlock and keep sound ON
        unlock(true);
        return;
      }
      setSoundEnabled(!enabled);
    });

    window.addEventListener("keydown", (event) => {
      if (
        event.key?.toLowerCase() === "m"
        && !event.metaKey
        && !event.ctrlKey
        && !event.altKey
        && !(event.target instanceof HTMLElement && event.target.matches("input, textarea, [contenteditable]"))
      ) {
        setSoundEnabled(!enabled);
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) {
        stopAmbientLoop();
      } else if (enabled && unlocked) {
        startAmbientLoop();
      }
    });

    // Hover sound triggers across interactive elements (matching jithinrp.com)
    let lastHoverTarget = null;
    let lastHoverTime = 0;
    document.addEventListener(
      "pointerover",
      (event) => {
        if (!enabled) return;
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;
        const hit = target.closest(
          "a, button, [role='tab'], [data-href], .jrp-tool, .jrp-ai-card, .jrp-about__photo, .jrp-pillar, .jrp-award",
        );
        if (!hit || hit === lastHoverTarget) return;
        const now = performance.now();
        if (now - lastHoverTime < 45) return;
        lastHoverTarget = hit;
        lastHoverTime = now;

        if (hit.classList.contains("jrp-tool")) {
          tick();
        } else if (
          hit.hasAttribute("data-href")
          || hit.classList.contains("jrp-ai-card")
          || hit.classList.contains("jrp-about__photo")
        ) {
          bubble();
        } else {
          drop();
        }
      },
      { passive: true },
    );

    syncUI();

    return { drop, bubble, tick, pop, unpop, unlock };
  })();

  // Wire modal open/close & viewer tabs to sound effects
  document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      soundApi.pop();
    });
  });
  document.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      soundApi.unpop();
    });
  });
  document.querySelectorAll(".viewer-tabs [role='tab']").forEach((tab) => {
    tab.addEventListener("click", () => {
      soundApi.drop();
    });
  });

  // 12. About Section Photo Stage: 5-Photo Switcher, Scroll Parallax, Pointer Tilt & CRT Glitch
  const aboutSection = document.querySelector("[data-about-section]");
  const aboutPhotoFrame = document.querySelector("[data-about-photo]");
  const aboutPhotoStage = document.querySelector("[data-about-photo-stage]");
  const aboutPhotoImg = document.querySelector("[data-about-photo-img]");
  const aboutGlitchEl = document.querySelector("[data-about-glitch]");
  const aboutCaptionEl = document.querySelector("[data-about-photo-caption]");
  const aboutThumbs = Array.from(document.querySelectorAll("[data-about-thumb]"));

  const aboutPhotos = [
    {
      src: "assets/about/photo-1.jpg",
      pos: "50% 24%",
      caption: "01 / 05 · BE. MAKER / CERTUS EVENT",
      alt: "Apratim Sarkar at the Be. Maker / Certus Ecosystem event",
    },
    {
      src: "assets/about/photo-5.jpg",
      pos: "50% 30%",
      caption: "02 / 05 · HIGH ALTITUDE EXPEDITION",
      alt: "Apratim Sarkar in the snowy Himalayas by a glacial lake",
    },
    {
      src: "assets/about/photo-2.jpg",
      pos: "50% 22%",
      caption: "03 / 05 · INFOSYS CAMPUS",
      alt: "Apratim Sarkar at Infosys campus in front of an artistic mural",
    },
    {
      src: "assets/about/photo-4.jpg",
      pos: "50% 20%",
      caption: "04 / 05 · MYSORE HERITAGE",
      alt: "Apratim Sarkar in front of the Infosys Mysore heritage building",
    },
    {
      src: "assets/about/photo-3.jpg",
      pos: "50% 22%",
      caption: "05 / 05 · KOLKATA PORTRAIT",
      alt: "Apratim Sarkar portrait in yellow kurta",
    },
  ];

  if (aboutPhotoFrame && aboutPhotoStage && aboutPhotoImg) {
    const isSubdir = window.location.pathname.includes("/work/");
    const basePrefix = isSubdir ? "../" : "";

    // Preload all 5 photos so transitions and cursor trail are instant
    aboutPhotos.forEach((item) => {
      const img = new Image();
      img.src = `${basePrefix}${item.src}`;
    });

    let activePhotoIndex = 0;
    let aboutHovering = false;
    let aboutInView = false;
    let lastManualSwitchTime = 0;

    const triggerScreenGlitch = (durationMs = 360) => {
      if (!isMotionAllowed()) return;
      aboutPhotoFrame.classList.remove("is-glitching");
      void aboutPhotoFrame.offsetWidth;
      aboutPhotoFrame.classList.add("is-glitching");
      window.setTimeout(() => {
        aboutPhotoFrame.classList.remove("is-glitching");
      }, durationMs);
    };

    const setAboutPhoto = (index, withSound = true) => {
      if (withSound) {
        lastManualSwitchTime = performance.now();
      }
      const normalized = ((index % aboutPhotos.length) + aboutPhotos.length) % aboutPhotos.length;
      if (normalized === activePhotoIndex && aboutPhotoImg.getAttribute("src") === aboutPhotos[normalized].src) {
        return;
      }
      activePhotoIndex = normalized;
      const target = aboutPhotos[normalized];

      aboutThumbs.forEach((btn, idx) => {
        const isCurrent = idx === normalized;
        btn.classList.toggle("is-active", isCurrent);
        btn.setAttribute("aria-selected", String(isCurrent));
      });

      triggerScreenGlitch(380);

      // Animate SVG displacement ripple during photo switch
      const disp = document.querySelector("#trail-liquid-0 feDisplacementMap");
      if (disp && isMotionAllowed()) {
        aboutPhotoFrame.classList.add("is-switching");
        const t0 = performance.now();
        const rippleTick = (now) => {
          const k = Math.min(1, (now - t0) / 380);
          disp.setAttribute("scale", ((1 - k) ** 2 * 26).toFixed(1));
          if (k < 1) {
            window.requestAnimationFrame(rippleTick);
          } else {
            aboutPhotoFrame.classList.remove("is-switching");
          }
        };
        window.requestAnimationFrame(rippleTick);
      }

      aboutPhotoImg.src = target.src;
      aboutPhotoImg.alt = target.alt;
      aboutPhotoImg.style.objectPosition = target.pos;
      if (aboutGlitchEl instanceof HTMLElement) {
        aboutGlitchEl.style.backgroundImage = `url('${target.src}')`;
        aboutGlitchEl.style.backgroundPosition = target.pos;
      }
      if (aboutCaptionEl) {
        aboutCaptionEl.textContent = target.caption;
      }

      if (withSound) {
        soundApi.bubble();
      }
    };

    aboutPhotoFrame.addEventListener("click", () => {
      setAboutPhoto(activePhotoIndex + 1, true);
    });

    aboutPhotoFrame.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setAboutPhoto(activePhotoIndex + 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setAboutPhoto(activePhotoIndex + 1, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setAboutPhoto(activePhotoIndex - 1, true);
      }
    });

    aboutThumbs.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        setAboutPhoto(idx, true);
      });
    });

    aboutPhotoFrame.addEventListener("pointerenter", () => {
      aboutHovering = true;
    });

    aboutPhotoFrame.addEventListener("pointermove", (event) => {
      if (!isMotionAllowed()) return;
      const rect = aboutPhotoFrame.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      aboutPhotoStage.style.setProperty("--photo-tilt-x", `${(-nx * 18).toFixed(1)}px`);
      aboutPhotoStage.style.setProperty("--photo-tilt-y", `${(-ny * 14).toFixed(1)}px`);
    });

    aboutPhotoFrame.addEventListener("pointerleave", () => {
      aboutHovering = false;
      aboutPhotoStage.style.setProperty("--photo-tilt-x", "0px");
      aboutPhotoStage.style.setProperty("--photo-tilt-y", "0px");
    });

    // Scroll-scrubbed parallax on .jrp-about__photo-stage
    const updateAboutPhotoParallax = () => {
      if (!isMotionAllowed()) return;
      const rect = aboutPhotoFrame.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const parallaxY = (0.5 - clamped) * 56;
      const scale = 1.04 + Math.sin(clamped * Math.PI) * 0.055;
      aboutPhotoStage.style.setProperty("--photo-parallax-y", `${parallaxY.toFixed(1)}px`);
      aboutPhotoStage.style.setProperty("--photo-parallax-scale", scale.toFixed(3));
    };
    window.addEventListener("scroll", updateAboutPhotoParallax, { passive: true });
    window.addEventListener("resize", updateAboutPhotoParallax);
    updateAboutPhotoParallax();

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            aboutInView = entry.isIntersecting;
          });
        },
        { threshold: 0.2 },
      );
      obs.observe(aboutPhotoFrame);
    }

    // Periodic screen-slice glitch & auto-reel cycle while in view
    window.setInterval(() => {
      if (aboutInView && !aboutHovering && !document.hidden && isMotionAllowed()) {
        triggerScreenGlitch(320);
      }
    }, 4200);

    window.setInterval(() => {
      if (
        aboutInView
        && !aboutHovering
        && !document.hidden
        && isMotionAllowed()
        && performance.now() - lastManualSwitchTime > 8500
      ) {
        setAboutPhoto(activePhotoIndex + 1, false);
      }
    }, 6800);
  }

  // 13. Cursor Liquid Photo Trail in #about (jithinrp.com setupAboutTrail)
  if (aboutSection && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const trailLayer = document.createElement("div");
    trailLayer.className = "jrp-about-trail";
    trailLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(trailLayer);

    const dispMaps = [0, 1, 2, 3, 4, 5].map((i) =>
      document.querySelector(`#trail-liquid-${i} feDisplacementMap`),
    );

    let lastTrailX = -9999;
    let lastTrailY = -9999;
    let trailPhotoIdx = 0;
    let filterSlot = 0;
    let lastTrailSound = 0;

    const isTrailSubdir = window.location.pathname.includes("/work/");
    const trailBasePrefix = isTrailSubdir ? "../" : "";

    const spawnTrailPhoto = (x, y, dx, dy) => {
      if (!isMotionAllowed()) return;
      const photo = aboutPhotos[trailPhotoIdx % aboutPhotos.length];
      trailPhotoIdx += 1;

      const img = document.createElement("img");
      img.className = "jrp-about-trail__item";
      img.src = `${trailBasePrefix}${photo.src}`;
      img.alt = "";
      img.style.objectPosition = photo.pos;
      trailLayer.appendChild(img);

      const slot = filterSlot % dispMaps.length;
      filterSlot += 1;
      const disp = dispMaps[slot];
      if (disp) {
        img.style.filter = `url(#trail-liquid-${slot})`;
        const t0 = performance.now();
        const dur = 360;
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          disp.setAttribute("scale", ((1 - k) ** 2 * 34).toFixed(1));
          if (k < 1) {
            window.requestAnimationFrame(step);
          } else {
            img.style.filter = "none";
          }
        };
        window.requestAnimationFrame(step);
      }

      const now = performance.now();
      if (now - lastTrailSound > 95) {
        lastTrailSound = now;
        soundApi.tick();
      }

      const rot = (Math.random() - 0.5) * 18;
      const driftX = Math.max(-60, Math.min(60, dx * 0.45));
      const driftY = Math.max(-60, Math.min(60, dy * 0.45));

      img.style.transition = "none";
      img.style.opacity = "0";
      img.style.borderRadius = "50%";
      img.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.3) rotate(${(rot * 0.3).toFixed(1)}deg)`;
      void img.offsetWidth;

      img.style.transition =
        "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, border-radius 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      img.style.opacity = "1";
      img.style.borderRadius = "3px";
      img.style.transform = `translate(${(x + driftX).toFixed(1)}px, ${(y + driftY).toFixed(1)}px) translate(-50%, -50%) scale(1) rotate(${rot.toFixed(1)}deg)`;

      window.setTimeout(() => {
        img.style.transition =
          "transform 0.55s cubic-bezier(0.55, 0, 0.78, 0), opacity 0.48s ease-in, border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        img.style.opacity = "0";
        img.style.borderRadius = "48% 48% 50% 50% / 34% 34% 66% 66%";
        img.style.transform = `translate(${(x + driftX).toFixed(1)}px, ${(y + driftY + 44).toFixed(1)}px) translate(-50%, -50%) scale(0.5, 0.66) rotate(${(rot * 0.5).toFixed(1)}deg)`;
        window.setTimeout(() => {
          img.remove();
        }, 560);
      }, 420);
    };

    aboutSection.addEventListener("pointermove", (event) => {
      if (!isMotionAllowed()) return;
      const targetEl = event.target instanceof Element ? event.target : null;
      // Don't spawn floating trail cards while hovering directly over the portrait viewer or its switcher tabs
      if (targetEl?.closest("[data-about-photo], .jrp-about__thumbs")) {
        return;
      }
      const dx = event.clientX - lastTrailX;
      const dy = event.clientY - lastTrailY;
      if (Math.hypot(dx, dy) > 55) {
        spawnTrailPhoto(event.clientX, event.clientY, dx, dy);
        lastTrailX = event.clientX;
        lastTrailY = event.clientY;
      }
    });
  }

  // 14. Scroll-Scrubbed Liquid Headings, Hero Exit Melt & Horizontal Track Jelly Skew
  const displayHeadings = Array.from(
    document.querySelectorAll(".jrp-display, .jrp-case-hero__title, .jrp-case-section__title"),
  );
  const heroMeltDisp = document.getElementById("liquid-melt-disp");

  const updateScrollLiquidEffects = () => {
    if (!isMotionAllowed()) return;
    const vh = Math.max(1, window.innerHeight);

    // Hero pixel title exit melt
    if (pixelTitle && heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < 0) {
        const k = Math.max(0, Math.min(1, -heroRect.top / Math.max(1, heroRect.height * 0.75)));
        const e = k * k;
        pixelTitle.classList.add("is-melting");
        pixelTitle.style.transformOrigin = "50% 0%";
        pixelTitle.style.transform = `translateY(${(-e * 22).toFixed(1)}px) scaleY(${(1 + e * 0.26).toFixed(3)})`;
        pixelTitle.style.opacity = (1 - e * 0.65).toFixed(3);
        if (heroMeltDisp) {
          heroMeltDisp.setAttribute("scale", (e * 24).toFixed(1));
        }
      } else if (heroRect.top >= 0 && !heroPointerActive) {
        pixelTitle.classList.remove("is-melting");
        pixelTitle.style.transform = "";
        pixelTitle.style.opacity = "";
        if (heroMeltDisp) {
          heroMeltDisp.setAttribute("scale", "0");
        }
      }
    }

    // Section display headings condense-in & melt-out
    displayHeadings.forEach((heading) => {
      if (!heading.classList.contains("is-revealed")) return;
      const r = heading.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const center = r.top + r.height * 0.5;
      const p = 1 - center / vh;

      let y = 0;
      let sy = 1;
      let sx = 1;
      let blur = 0;

      if (p < 0.16) {
        const k = Math.max(0, Math.min(1, (0.16 - p) / 0.24));
        const e = k * k;
        y = e * 24;
        sy = 1 + e * 0.14;
        sx = 1 - e * 0.03;
        blur = e * 7;
      } else if (p > 0.84) {
        const k = Math.max(0, Math.min(1, (p - 0.84) / 0.22));
        const e = k * k;
        y = -e * 22;
        sy = 1 + e * 0.16;
        sx = 1 - e * 0.03;
        blur = e * 6;
      }

      if (blur < 0.15 && Math.abs(y) < 0.4) {
        heading.style.transform = "translateY(0)";
        heading.style.filter = "none";
      } else {
        heading.style.transform = `translateY(${y.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        heading.style.filter = `blur(${blur.toFixed(2)}px)`;
      }
    });
  };

  window.addEventListener("scroll", updateScrollLiquidEffects, { passive: true });

  // Horizontal Track Jelly Skew & Quotes Auto-Scroll
  draggableTracks.forEach((track) => {
    let lastScrollLeft = track.scrollLeft;
    let trackSkew = 0;
    let trackRaf = 0;

    const decayTrackJelly = () => {
      trackSkew *= 0.84;
      if (Math.abs(trackSkew) < 0.08) {
        trackSkew = 0;
        trackRaf = 0;
      } else {
        trackRaf = window.requestAnimationFrame(decayTrackJelly);
      }
      const scaleX = 1 + Math.min(0.035, Math.abs(trackSkew) * 0.004);
      Array.from(track.children).forEach((card) => {
        if (card instanceof HTMLElement) {
          card.style.setProperty("--card-skew", `${trackSkew.toFixed(2)}deg`);
          card.style.setProperty("--card-scale-x", scaleX.toFixed(3));
        }
      });
    };

    track.addEventListener(
      "scroll",
      () => {
        if (!isMotionAllowed()) return;
        const delta = track.scrollLeft - lastScrollLeft;
        lastScrollLeft = track.scrollLeft;
        const target = Math.max(-5.5, Math.min(5.5, delta * -0.14));
        trackSkew += (target - trackSkew) * 0.35;
        if (!trackRaf) {
          trackRaf = window.requestAnimationFrame(decayTrackJelly);
        }
      },
      { passive: true },
    );
  });

  // Seamless Infinite Loop on the Recognition & Impact horizontal strip (matching jithinrp.com)
  const quotesTrack = document.querySelector(".jrp-track--quotes");
  if (quotesTrack) {
    const origFigures = Array.from(quotesTrack.querySelectorAll(".jrp-quote"));
    let quotesBaseWidth = 0;
    let quotesOffset = 0;
    let quotesInView = false;
    let quotesPaused = false;

    if (origFigures.length > 0) {
      for (let c = 0; c < 2; c += 1) {
        origFigures.forEach((fig) => {
          const clone = fig.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          quotesTrack.appendChild(clone);
        });
      }
      quotesTrack.classList.add("is-infinite-ready");

      const measureQuotesWidth = () => {
        const first = origFigures[0];
        const last = origFigures[origFigures.length - 1];
        if (first && last) {
          const r1 = first.getBoundingClientRect();
          const r2 = last.getBoundingClientRect();
          quotesBaseWidth = r2.right - r1.left;
        }
      };
      measureQuotesWidth();
      window.addEventListener("resize", measureQuotesWidth);
    }

    quotesTrack.addEventListener("pointerenter", () => {
      quotesPaused = true;
    });
    quotesTrack.addEventListener("pointerleave", () => {
      quotesPaused = false;
    });
    quotesTrack.addEventListener("focusin", () => {
      quotesPaused = true;
    });
    quotesTrack.addEventListener("focusout", () => {
      quotesPaused = false;
    });

    if ("IntersectionObserver" in window) {
      const qObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            quotesInView = entry.isIntersecting;
          });
        },
        { threshold: 0.15 },
      );
      qObs.observe(quotesTrack.parentElement ?? quotesTrack);
    }

    const tickQuotesScroll = () => {
      if (isMotionAllowed() && quotesInView && !quotesPaused && !document.hidden && quotesBaseWidth > 0) {
        quotesOffset -= 0.55 + Math.min(1.6, Math.abs(scrollVelocity) * 0.08);
        if (quotesOffset <= -quotesBaseWidth) {
          quotesOffset += quotesBaseWidth;
        }
        quotesTrack.style.transform = `translate3d(${quotesOffset.toFixed(2)}px, 0, 0)`;
      }
      window.requestAnimationFrame(tickQuotesScroll);
    };
    window.requestAnimationFrame(tickQuotesScroll);
  }

  // 15. Tapered Difference-Blend Cursor Trail Canvas (jithinrp.com setupCursorTrail)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const trailCanvas = document.createElement("canvas");
    trailCanvas.className = "jrp-cursor-trail";
    trailCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(trailCanvas);
    const tCtx = trailCanvas.getContext("2d");

    const COUNT = 14;
    const HEAD = 4;
    const FOLLOW = 0.42;
    const pts = Array.from({ length: COUNT }, () => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    let alpha = 0;
    let seen = false;

    const resizeTrailCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      trailCanvas.width = window.innerWidth * dpr;
      trailCanvas.height = window.innerHeight * dpr;
      tCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas);

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        if (!seen) {
          pts.forEach((p) => {
            p.x = mouse.x;
            p.y = mouse.y;
          });
          seen = true;
        }
      },
      { passive: true },
    );

    document.documentElement.addEventListener("pointerleave", () => {
      seen = false;
      alpha = 0;
    });

    const tickCursorTrail = () => {
      if (tCtx && isMotionAllowed()) {
        pts[0].x += (mouse.x - pts[0].x) * 0.6;
        pts[0].y += (mouse.y - pts[0].y) * 0.6;
        for (let i = 1; i < COUNT; i += 1) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * FOLLOW;
          pts[i].y += (pts[i - 1].y - pts[i].y) * FOLLOW;
        }
        const tailLen = Math.hypot(pts[0].x - pts[COUNT - 1].x, pts[0].y - pts[COUNT - 1].y);
        const target = seen && !isCursorPillActive ? Math.min(1, tailLen / 40) : 0;
        alpha += (target - alpha) * 0.2;

        tCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (alpha > 0.01) {
          const trailColors = [
            "#d94826",
            "#c2413b",
            "#9b3668",
            "#6d28d9",
            "#4f36cf",
            "#2945c4",
            "#1c5fa6",
            "#0d7a68",
            "#0f8a73",
            "#14967f",
            "#2945c4",
            "#6d28d9",
            "#d94826",
          ];
          tCtx.globalAlpha = alpha * 0.82;
          tCtx.lineCap = "round";
          for (let i = 0; i < COUNT - 1; i += 1) {
            tCtx.strokeStyle = trailColors[i % trailColors.length];
            tCtx.lineWidth = HEAD * 2 * (1 - i / COUNT);
            tCtx.beginPath();
            tCtx.moveTo(pts[i].x, pts[i].y);
            tCtx.lineTo(pts[i + 1].x, pts[i + 1].y);
            tCtx.stroke();
          }
        }
      }
      window.requestAnimationFrame(tickCursorTrail);
    };
    window.requestAnimationFrame(tickCursorTrail);
  }

  // 16. Scroll-Velocity Spring Content Lean, Spherical Ball-Lens Drum & Oval Fluid Monolith Scroll
  const leanTargets = Array.from(
    document.querySelectorAll(
      ".jrp-pillar, .jrp-work__intro, .jrp-work__col .jrp-fact, .jrp-step, .jrp-award, .jrp-journey__item, .jrp-case-meta__item, .jrp-case-kpi__card, .jrp-decision-card, .jrp-case-compare__card",
    ),
  );
  let springLean = 0;
  let springLeanV = 0;
  let lastLeanShown = 0;
  let ballStrength = 0.045;
  const monolithPondState = new WeakMap();

  const heroLedeEl = document.querySelector(".jrp-hero__lede");
  const heroMetaEl = document.querySelector(".jrp-hero__meta");
  const heroNameRowEl = document.querySelector(".jrp-hero__name-row");
  let heroTiltX = 0;
  let heroTiltY = 0;
  let heroTiltTargetX = 0;
  let heroTiltTargetY = 0;

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        heroTiltTargetX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        heroTiltTargetY = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      },
      { passive: true },
    );
  }

  const tickSpringAndHeroDepth = () => {
    if (isMotionAllowed()) {
      const dt = 0.016;
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const targetLean = Math.max(-2.6, Math.min(2.6, -scrollVelocity * 0.08));
      springLeanV += (50 * (targetLean - springLean) - 10 * springLeanV) * dt;
      springLean += springLeanV * dt;
      const rounded = Math.round(springLean * 100) / 100;
      if (rounded !== lastLeanShown) {
        lastLeanShown = rounded;
        const val = Math.abs(rounded) < 0.04 ? "0deg" : `${rounded}deg`;
        leanTargets.forEach((el) => {
          el.style.setProperty("--scroll-lean", val);
        });
      }

      // Spherical Ball-Lens Drum Warp (from reference setupBallLens)
      const speedPxPerSec = Math.abs(scrollVelocity) * 60;
      const velNorm = Math.min(1, speedPxPerSec / 1400);
      const targetBall = 0.042 + 0.145 * velNorm;
      ballStrength += (targetBall - ballStrength) * 0.12;
      const L = ballStrength;

      leanTargets.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < -90 || r.top > vh + 90) {
          if (el.style.translate) {
            el.style.translate = "";
            el.style.scale = "";
          }
          return;
        }
        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.5;
        const ny = Math.max(-1.15, Math.min(1.15, 1 - (2 * cy) / vh));
        const k = L * ny * ny;
        const sx = 1 - 0.5 * k;
        const sy = Math.max(0.85, 1 - 1.75 * k);
        const dx = (cx - vw * 0.5) * -0.45 * k;
        const dy = ((ny * k * vh) / 2) * 0.65;
        el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        el.style.scale = `${sx.toFixed(3)} ${sy.toFixed(3)}`;
      });

      // Selected Works & Case Showcase Monolith 3D Water Buoyancy & Perspective Scroll Curve
      monolithCards.forEach((monolith) => {
        if (!(monolith instanceof HTMLElement)) return;
        const r = monolith.getBoundingClientRect();
        if (r.bottom < -160 || r.top > vh + 160 || r.right < -160 || r.left > vw + 160) {
          return;
        }

        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.5;
        const ny = Math.max(-1.25, Math.min(1.25, 1 - (2 * cy) / vh));

        // On project case-study pages (.jrp-case-showcase), drive a 3D perspective unfold (never squish into an egg)
        if (monolith.closest(".jrp-case-showcase")) {
          const distFromCenter = Math.min(1, Math.abs(ny));
          const caseScale = 1 - distFromCenter * 0.032;
          const caseRx = Math.max(-8, Math.min(10, ny * -6.5 + scrollVelocity * 0.08));
          const caseY = Math.max(-16, Math.min(16, -scrollVelocity * 0.35));
          monolith.style.setProperty("--case-mono-scale", caseScale.toFixed(3));
          monolith.style.setProperty("--case-mono-rx", `${caseRx.toFixed(2)}deg`);
          monolith.style.setProperty("--case-mono-y", `${caseY.toFixed(1)}px`);
          monolith.style.setProperty("--mono-oval-radius", "22px");
          return;
        }

        const midEl = monolith.closest(".jrp-work__mid");
        const nx = Math.max(-1.25, Math.min(1.25, 1 - (2 * cx) / vw));
        const primaryN = worksMode === "reel" ? nx : ny;
        const dist = Math.min(1, Math.abs(primaryN));
        const edgeCurve = Math.pow(dist, 1.2);

        // Subtle architectural water-meniscus corner curve (18px -> 28px) that never clips internal text or CTAs
        const ovalAmount = Math.min(1, Math.max(0.04, edgeCurve * 0.72 + velNorm * 0.28));
        const cornerPx = 18 + ovalAmount * 12;
        const ovalRadius = `${cornerPx.toFixed(1)}px`;

        // Refined 3D water buoyancy & drum tilt
        const k = (0.035 + 0.085 * velNorm) * primaryN * primaryN;
        const ballSx = 1 - 0.14 * k;
        const ballSy = Math.max(0.94, 1 - 0.24 * k);
        const ballDx = (cx - vw * 0.5) * -0.18 * k;
        const ballDy = primaryN * k * vh * 0.16;
        const bendY = Math.max(-16, Math.min(16, -scrollVelocity * 0.38));
        const drumRx = Math.max(-9, Math.min(9, primaryN * -6.5 + scrollVelocity * 0.09));
        const velSkew = Math.max(-2.2, Math.min(2.2, scrollVelocity * -0.045));

        monolith.style.setProperty("--oval-amount", ovalAmount.toFixed(3));
        monolith.style.setProperty("--mono-oval-radius", ovalRadius);
        monolith.style.setProperty("--mono-ball-dx", `${ballDx.toFixed(1)}px`);
        monolith.style.setProperty("--mono-ball-dy", `${ballDy.toFixed(1)}px`);
        monolith.style.setProperty("--mono-bend-y", `${bendY.toFixed(1)}px`);
        monolith.style.setProperty("--mono-ball-sx", ballSx.toFixed(3));
        monolith.style.setProperty("--mono-ball-sy", ballSy.toFixed(3));
        monolith.style.setProperty("--mono-drum-rx", `${drumRx.toFixed(2)}deg`);
        monolith.style.setProperty("--mono-vel-skew", `${velSkew.toFixed(2)}deg`);

        if (midEl instanceof HTMLElement) {
          midEl.style.setProperty("--oval-amount", ovalAmount.toFixed(3));
          const wasCentered = monolithPondState.get(monolith) ?? false;
          const isCentered = dist < 0.3;
          if (isCentered && !wasCentered) {
            midEl.classList.remove("is-pond-rippling");
            void midEl.offsetWidth;
            midEl.classList.add("is-pond-rippling");
          }
          monolithPondState.set(monolith, isCentered);
        }
      });

      if (heroSection && heroInView) {
        heroTiltX += (heroTiltTargetX - heroTiltX) * 0.07;
        heroTiltY += (heroTiltTargetY - heroTiltY) * 0.07;
        const y = window.scrollY;
        const h = Math.max(1, heroSection.offsetHeight);
        const near = Math.max(0, 1 - y / h);
        if (heroLedeEl instanceof HTMLElement) {
          heroLedeEl.style.translate = `${(heroTiltX * -10 * near).toFixed(1)}px ${(y * 0.16 + heroTiltY * -5 * near).toFixed(1)}px`;
        }
        if (heroMetaEl instanceof HTMLElement) {
          heroMetaEl.style.translate = `${(heroTiltX * -5 * near).toFixed(1)}px ${(y * 0.07 + heroTiltY * -3 * near).toFixed(1)}px`;
        }
        if (heroNameRowEl instanceof HTMLElement) {
          heroNameRowEl.style.translate = `${(heroTiltX * 12 * near).toFixed(1)}px ${(y * -0.05 + heroTiltY * 6 * near).toFixed(1)}px`;
        }
      }
    }
    window.requestAnimationFrame(tickSpringAndHeroDepth);
  };
  window.requestAnimationFrame(tickSpringAndHeroDepth);

  // 17. Selected Works Enhancements: Chapter Bar, Horizontal Reel Mode, Monolith Water Ripple, 3D Tilt & WebGL SDF Liquid Sheet Transition
  const worksSection = document.querySelector("[data-works-section]");
  const worksViewport = document.querySelector("[data-works-viewport]");
  const worksRows = Array.from(document.querySelectorAll(".jrp-work[data-href]"));
  const workChapterBtns = Array.from(document.querySelectorAll("[data-work-jump]"));
  const workModeBtns = Array.from(document.querySelectorAll("[data-works-mode]"));
  const workReelArrows = document.querySelector("[data-works-reel-arrows]");
  const workPrevBtn = document.querySelector("[data-works-prev]");
  const workNextBtn = document.querySelector("[data-works-next]");
  let worksMode = "stack";
  let activeWorkIdx = 0;

  const setActiveWorkChapter = (idx) => {
    const clamped = Math.max(0, Math.min(worksRows.length - 1, idx));
    activeWorkIdx = clamped;
    workChapterBtns.forEach((btn, i) => {
      btn.classList.toggle("is-active", i === clamped);
    });
    if (workPrevBtn instanceof HTMLButtonElement) {
      workPrevBtn.disabled = clamped <= 0;
    }
    if (workNextBtn instanceof HTMLButtonElement) {
      workNextBtn.disabled = clamped >= worksRows.length - 1;
    }
  };

  const setWorksLayoutMode = (mode) => {
    worksMode = mode === "reel" ? "reel" : "stack";
    worksSection?.classList.toggle("is-reel-mode", worksMode === "reel");
    workModeBtns.forEach((btn) => {
      const active = btn.getAttribute("data-works-mode") === worksMode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    if (workReelArrows instanceof HTMLElement) {
      workReelArrows.hidden = worksMode !== "reel";
    }
    soundApi.drop();
  };

  workModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setWorksLayoutMode(btn.getAttribute("data-works-mode") ?? "stack");
    });
  });

  workChapterBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      setActiveWorkChapter(idx);
      const targetRow = worksRows[idx];
      if (!targetRow) return;
      if (worksMode === "reel" && worksViewport instanceof HTMLElement) {
        worksViewport.scrollTo({
          left: idx * window.innerWidth,
          behavior: isMotionAllowed() ? "smooth" : "auto",
        });
      } else {
        targetRow.scrollIntoView({ behavior: isMotionAllowed() ? "smooth" : "auto", block: "start" });
      }
      soundApi.bubble();
    });
  });

  workPrevBtn?.addEventListener("click", () => {
    const nextIdx = Math.max(0, activeWorkIdx - 1);
    workChapterBtns[nextIdx]?.click();
  });

  workNextBtn?.addEventListener("click", () => {
    const nextIdx = Math.min(worksRows.length - 1, activeWorkIdx + 1);
    workChapterBtns[nextIdx]?.click();
  });

  // Track active chapter on vertical scroll or horizontal reel scroll + horizontal jelly skew
  if (worksViewport instanceof HTMLElement) {
    let lastReelScroll = 0;
    let reelSkew = 0;
    let reelRaf = 0;

    const decayReelSkew = () => {
      reelSkew *= 0.84;
      if (Math.abs(reelSkew) < 0.06) {
        reelSkew = 0;
        reelRaf = 0;
      } else {
        reelRaf = window.requestAnimationFrame(decayReelSkew);
      }
      worksSection?.style.setProperty("--work-reel-skew", `${reelSkew.toFixed(2)}deg`);
    };

    worksViewport.addEventListener(
      "scroll",
      () => {
        if (worksMode !== "reel") return;
        const sl = worksViewport.scrollLeft;
        const delta = sl - lastReelScroll;
        lastReelScroll = sl;
        const idx = Math.round(sl / Math.max(1, window.innerWidth));
        setActiveWorkChapter(idx);

        if (isMotionAllowed()) {
          const target = Math.max(-4.5, Math.min(4.5, delta * -0.12));
          reelSkew += (target - reelSkew) * 0.35;
          if (!reelRaf) {
            reelRaf = window.requestAnimationFrame(decayReelSkew);
          }
        }
      },
      { passive: true },
    );
  }

  window.addEventListener(
    "scroll",
    () => {
      if (worksMode !== "stack") return;
      const midY = window.innerHeight * 0.45;
      worksRows.forEach((row, idx) => {
        const r = row.getBoundingClientRect();
        if (r.top <= midY && r.bottom >= midY) {
          setActiveWorkChapter(idx);
        }
      });
    },
    { passive: true },
  );

  // Monolith Water Ripple, 3D Magnetic Tilt, Specular Sheen & Auto-Cycling Tabs
  const triggerMonolithRipple = (monolith, maxScale = 22, duration = 620, rx = "50%", ry = "50%") => {
    if (!isMotionAllowed() || !(monolith instanceof HTMLElement)) return;
    monolith.style.setProperty("--ring-x", rx);
    monolith.style.setProperty("--ring-y", ry);
    monolith.classList.remove("is-rippling");
    void monolith.offsetWidth;
    monolith.classList.add("is-rippling");

    const filterId = monolith.getAttribute("data-liquid-filter");
    const disp = filterId ? document.querySelector(`#${filterId} feDisplacementMap`) : null;
    if (disp && filterId) {
      monolith.style.filter = `url(#${filterId})`;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / duration);
        const wave = Math.sin(k * Math.PI) * (1 - k * 0.6) * maxScale;
        disp.setAttribute("scale", wave.toFixed(1));
        if (k < 1) {
          window.requestAnimationFrame(step);
        } else {
          disp.setAttribute("scale", "0");
          monolith.style.filter = "";
        }
      };
      window.requestAnimationFrame(step);
    }
  };

  monolithCards.forEach((monolith) => {
    let monoHover = false;
    let monoInView = false;
    let lastTabInteraction = 0;

    // Water touchdown when monolith enters viewport
    if ("IntersectionObserver" in window) {
      let hasTouchedDown = false;
      const monoObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            monoInView = entry.isIntersecting;
            if (entry.isIntersecting && !hasTouchedDown) {
              hasTouchedDown = true;
              window.setTimeout(() => {
                triggerMonolithRipple(monolith, 20, 680, "50%", "50%");
              }, 240);
            }
          });
        },
        { threshold: 0.35 },
      );
      monoObs.observe(monolith);
    }

    monolith.addEventListener("pointerenter", (event) => {
      monoHover = true;
      const rect = monolith.getBoundingClientRect();
      const rx = `${(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100).toFixed(1)}%`;
      const ry = `${(((event.clientY - rect.top) / Math.max(1, rect.height)) * 100).toFixed(1)}%`;
      triggerMonolithRipple(monolith, 14, 480, rx, ry);
    });

    monolith.addEventListener("pointermove", (event) => {
      if (!isMotionAllowed()) return;
      const rect = monolith.getBoundingClientRect();
      const px = (event.clientX - rect.left) / Math.max(1, rect.width);
      const py = (event.clientY - rect.top) / Math.max(1, rect.height);
      const rx = (0.5 - py) * 5.5;
      const ry = (px - 0.5) * 6.5;
      monolith.style.setProperty("--mono-rx", `${rx.toFixed(2)}deg`);
      monolith.style.setProperty("--mono-ry", `${ry.toFixed(2)}deg`);
      monolith.style.setProperty("--mono-mx", `${(px * 100).toFixed(1)}%`);
      monolith.style.setProperty("--mono-my", `${(py * 100).toFixed(1)}%`);
    });

    monolith.addEventListener("pointerleave", () => {
      monoHover = false;
      monolith.style.setProperty("--mono-rx", "0deg");
      monolith.style.setProperty("--mono-ry", "0deg");
    });

    const tabs = Array.from(monolith.querySelectorAll('.viewer-tabs [role="tab"]'));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        lastTabInteraction = performance.now();
      });
    });

    // Auto-cycle monolith tabs gently when in view and not hovered
    window.setInterval(() => {
      if (
        !monoInView
        || monoHover
        || document.hidden
        || !isMotionAllowed()
        || tabs.length < 2
        || performance.now() - lastTabInteraction < 7500
      ) {
        return;
      }
      const currentIdx = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const nextTab = tabs[(currentIdx + 1) % tabs.length];
      if (nextTab instanceof HTMLElement) {
        // Trigger tab switch without stealing keyboard focus or playing click sound
        tabs.forEach((item) => {
          const selected = item === nextTab;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          const panel = monolith.querySelector(`#${item.getAttribute("aria-controls")}`);
          if (panel instanceof HTMLElement) {
            panel.hidden = !selected;
          }
        });
      }
    }, 4600);
  });

  // WebGL SDF Metaball Liquid Sheet Transition (jithinrp.com liquidSheet shader) & Hold-to-Open
  const createLiquidSheet = (host) => {
    const canvas = document.createElement("canvas");
    canvas.className = "jrp-page-cover__canvas";
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) return null;

    const vs = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
    const fs = `precision highp float;
      uniform vec2 uRes; uniform float uTime, uP;
      float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
      float h1(float n){ return fract(sin(n * 12.9898 + 4.1) * 43758.5453); }
      float surfaceWave(float x, float t){ return sin(x * 7.0 + t * 3.2) * 0.55 + sin(x * 13.0 - t * 4.1) * 0.3 + sin(x * 23.0 + t * 6.3) * 0.15; }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float asp = uRes.x / uRes.y;
        vec2 p = vec2(uv.x * asp, uv.y);
        float t = uTime;
        float amp = 0.055 * (1.0 - smoothstep(0.8, 1.0, uP));
        float level = mix(-0.14, 1.14, uP);
        float d = uv.y - (level + amp * surfaceWave(uv.x, t));
        for (int i = 0; i < 8; i++) {
          float fi = float(i);
          float x = h1(fi + 1.0);
          float ph = fract(uP * 1.5 + fi * 0.37);
          float hop = sin(ph * 3.14159) * (0.09 + 0.1 * h1(fi + 9.0)) * (1.0 - uP);
          float sx = level + amp * surfaceWave(x, t);
          float r = (0.014 + 0.022 * h1(fi + 3.0)) * (1.0 - smoothstep(0.75, 1.0, uP));
          d = smin(d, length(p - vec2(x * asp, sx + 0.015 + hop)) - r, 0.05);
        }
        float px = 1.2 / uRes.y;
        float a = 1.0 - smoothstep(-px, px, d);
        float rim = (1.0 - smoothstep(0.0, 0.012, abs(d + 0.006))) * a;
        vec3 baseCol = mix(vec3(0.11, 0.07, 0.22), vec3(0.28, 0.11, 0.34), clamp(uv.y * 0.9 + uv.x * 0.2, 0.0, 1.0));
        vec3 rimCol = vec3(0.95, 0.42, 0.22);
        gl_FragColor = vec4(mix(baseCol, rimCol, rim * 0.65), a);
      }`;

    const compileShader = (type, src) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    const vShader = compileShader(gl.VERTEX_SHADER, vs);
    const fShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!prog || !vShader || !fShader) return null;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uP = gl.getUniformLocation(prog, "uP");
    host.prepend(canvas);

    const t0 = performance.now();
    const render = (pVal) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uP, pVal);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    return { render };
  };

  let isNavigatingCover = false;
  const navigateWithLiquidCover = (href, wordLabel = "OPENING CASE STUDY") => {
    if (!href) return;
    if (!isMotionAllowed() || isNavigatingCover) {
      window.location.href = href;
      return;
    }
    isNavigatingCover = true;
    soundApi.pop();

    const cover = document.createElement("div");
    cover.className = "jrp-page-cover";
    cover.setAttribute("aria-hidden", "true");
    const wordEl = document.createElement("div");
    wordEl.className = "jrp-page-cover__word";
    wordEl.textContent = wordLabel;
    const countEl = document.createElement("div");
    countEl.className = "jrp-page-cover__count";
    countEl.textContent = "000";
    cover.append(wordEl, countEl);
    document.body.appendChild(cover);

    const sheet = createLiquidSheet(cover);
    if (!sheet) {
      cover.style.background = "#0a0a0a";
    }

    window.setTimeout(() => {
      cover.classList.add("is-showing");
    }, 120);

    const start = performance.now();
    const duration = 820;
    const tickFlood = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      sheet?.render(eased);
      countEl.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (t < 1) {
        window.requestAnimationFrame(tickFlood);
      } else {
        window.location.href = href;
      }
    };
    window.requestAnimationFrame(tickFlood);
  };

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      isNavigatingCover = false;
      document.querySelectorAll(".jrp-page-cover").forEach((el) => el.remove());
    }
  });

  // Wire Selected Works rows for Hold-to-Open liquid bubble & click navigation
  worksRows.forEach((row) => {
    const monolith = row.querySelector("[data-story-media]");
    const href = row.getAttribute("data-href");
    const wordLabel = row.getAttribute("data-work-word") ?? "OPENING CASE STUDY";
    let holdRaf = 0;
    let holdStart = 0;
    let holdStage = 0;
    let lastHoldProgress = 0;
    let isHolding = false;
    let didCompleteHold = false;

    const cancelHold = () => {
      if (!isHolding) return;
      isHolding = false;
      if (holdRaf) {
        window.cancelAnimationFrame(holdRaf);
        holdRaf = 0;
      }
      if (lastHoldProgress > 0.16 && !didCompleteHold) {
        soundApi.unpop();
      }
      lastHoldProgress = 0;
      holdStage = 0;
      cursorPillEl?.style.setProperty("--hold", "0");
      monolith?.classList.remove("is-holding");
    };

    row.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.pointerType === "touch") return;
      const interactive = event.target instanceof Element
        ? event.target.closest("a, button, [role='tab'], .jrp-tool, input, select, textarea")
        : null;
      if (interactive) return;

      isHolding = true;
      didCompleteHold = false;
      holdStage = 0;
      lastHoldProgress = 0;
      holdStart = performance.now();
      monolith?.classList.add("is-holding");
      if (monolith instanceof HTMLElement) {
        triggerMonolithRipple(monolith, 28, 720, "50%", "50%");
      }
      soundApi.bubble();

      const HOLD_MS = 680;
      const stepHold = (now) => {
        if (!isHolding) return;
        const p = Math.min(1, (now - holdStart) / HOLD_MS);
        lastHoldProgress = p;
        cursorPillEl?.style.setProperty("--hold", p.toFixed(3));
        if (p > 0.34 && holdStage < 1) {
          holdStage = 1;
          soundApi.tick();
        } else if (p > 0.68 && holdStage < 2) {
          holdStage = 2;
          soundApi.bubble();
        }
        if (p < 1) {
          holdRaf = window.requestAnimationFrame(stepHold);
        } else {
          isHolding = false;
          didCompleteHold = true;
          lastHoldProgress = 0;
          cursorPillEl?.style.setProperty("--hold", "0");
          monolith?.classList.remove("is-holding");
          navigateWithLiquidCover(href, wordLabel);
        }
      };
      holdRaf = window.requestAnimationFrame(stepHold);
    });

    window.addEventListener("pointerup", cancelHold);
    window.addEventListener("pointercancel", cancelHold);
    row.addEventListener("pointerleave", cancelHold);

    row.addEventListener("click", (event) => {
      if (didCompleteHold) {
        event.preventDefault();
        didCompleteHold = false;
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const targetEl = event.target instanceof Element ? event.target : null;
      if (targetEl?.closest("[role='tab'], .jrp-tool, button")) return;

      const clickedLink = targetEl?.closest("a");
      if (clickedLink instanceof HTMLAnchorElement) {
        const linkHref = clickedLink.getAttribute("href");
        if (linkHref && !linkHref.startsWith("#") && !clickedLink.hasAttribute("target")) {
          event.preventDefault();
          navigateWithLiquidCover(linkHref, wordLabel);
        }
        return;
      }

      if (href) {
        navigateWithLiquidCover(href, wordLabel);
      }
    });
  });

  // 18. Interactive 2D Canvas Water-Wave Meniscus Under Monolith Cards ("Project Cards on Water")
  if (!document.documentElement.classList.contains("is-lite-mode")) {
    const workMidCols = Array.from(document.querySelectorAll(".jrp-work__mid, .jrp-case-showcase"));
    workMidCols.forEach((midCol, colIdx) => {
      const canvas = document.createElement("canvas");
      canvas.className = "jrp-water-canvas";
      canvas.setAttribute("aria-hidden", "true");
      midCol.prepend(canvas);
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;

      const accentPalette = [
        "rgba(217, 72, 38, ",
        "rgba(41, 69, 196, ",
        "rgba(13, 122, 104, ",
        "rgba(109, 40, 217, ",
      ];
      const shadePrefix = accentPalette[colIdx % accentPalette.length];
      const ripples = [];
      let inView = false;

      const resizeWater = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.round(r.width * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizeWater();
      window.addEventListener("resize", resizeWater);

      const spawnRipple = (nx = 0.5, ny = 0.5, strength = 1) => {
        if (ripples.length > 8) ripples.shift();
        ripples.push({ nx, ny, r: 12, maxR: 220 + strength * 90, alpha: 0.42 * strength });
      };

      midCol.addEventListener("pointerenter", (e) => {
        const b = canvas.getBoundingClientRect();
        spawnRipple((e.clientX - b.left) / Math.max(1, b.width), (e.clientY - b.top) / Math.max(1, b.height), 1.1);
      });

      midCol.addEventListener("pointermove", (e) => {
        if (Math.random() > 0.28) return;
        const b = canvas.getBoundingClientRect();
        spawnRipple((e.clientX - b.left) / Math.max(1, b.width), (e.clientY - b.top) / Math.max(1, b.height), 0.55);
      });

      if ("IntersectionObserver" in window) {
        const wObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !inView) {
                spawnRipple(0.5, 0.14, 1.2);
                spawnRipple(0.5, 0.86, 1.2);
              }
              inView = entry.isIntersecting;
            });
          },
          { threshold: 0.15 },
        );
        wObs.observe(midCol);
      }

      const tickWater = (now) => {
        if (inView && isMotionAllowed()) {
          const w = canvas.clientWidth || 440;
          const h = canvas.clientHeight || 660;
          ctx2d.clearRect(0, 0, w, h);
          const t = now * 0.0018;

          // Top and bottom liquid meniscus waves (like jithinrp.com water reflection)
          for (let band = 0; band < 2; band += 1) {
            const baseY = band === 0 ? 34 : h - 34;
            const dir = band === 0 ? -1 : 1;
            for (let layer = 0; layer < 3; layer += 1) {
              ctx2d.beginPath();
              const yOff = dir * (layer * 7 + Math.sin(t + layer) * 3);
              ctx2d.moveTo(28, baseY + yOff);
              for (let x = 28; x <= w - 28; x += 14) {
                const u = (x - 28) / Math.max(1, w - 56);
                const env = Math.sin(u * Math.PI);
                const wave =
                  Math.sin(u * 9 + t * (1.6 + layer * 0.3)) * (5 + Math.abs(scrollVelocity) * 0.22) * env;
                ctx2d.lineTo(x, baseY + yOff + wave);
              }
              ctx2d.strokeStyle = `${shadePrefix}${(0.16 - layer * 0.04).toFixed(2)})`;
              ctx2d.lineWidth = 2 - layer * 0.4;
              ctx2d.stroke();
            }
          }

          // Propagating radial water ripples
          for (let i = ripples.length - 1; i >= 0; i -= 1) {
            const rp = ripples[i];
            rp.r += 2.6;
            rp.alpha *= 0.965;
            if (rp.alpha < 0.015 || rp.r > rp.maxR) {
              ripples.splice(i, 1);
              continue;
            }
            ctx2d.beginPath();
            ctx2d.ellipse(rp.nx * w, rp.ny * h, rp.r, rp.r * 0.42, 0, 0, Math.PI * 2);
            ctx2d.strokeStyle = `${shadePrefix}${rp.alpha.toFixed(3)})`;
            ctx2d.lineWidth = 1.6;
            ctx2d.stroke();
          }
        }
        window.requestAnimationFrame(tickWater);
      };
      window.requestAnimationFrame(tickWater);
    });
  }

  // 19. Interactive Water-Gesture Intro Gate ("Draw an A to enter" + Skip + ?lite + Replay)
  const introGate = document.querySelector("[data-intro-gate]");
  const introCanvas = document.querySelector("[data-intro-canvas]");
  const introSkipBtn = document.querySelector("[data-intro-skip]");
  const introStatusEl = document.querySelector("[data-intro-status]");
  const introPctEl = document.querySelector("[data-intro-pct]");
  const replayIntroBtn = document.querySelector("[data-replay-intro]");
  const mobileBanner = document.querySelector("[data-mobile-banner]");
  const mobileDismissBtn = document.querySelector("[data-mobile-banner-dismiss]");

  if (mobileBanner && mobileDismissBtn) {
    try {
      if (window.sessionStorage.getItem("jrp:mobile-banner-dismissed") === "1") {
        mobileBanner.hidden = true;
      }
    } catch {}
    mobileDismissBtn.addEventListener("click", () => {
      mobileBanner.hidden = true;
      try {
        window.sessionStorage.setItem("jrp:mobile-banner-dismissed", "1");
      } catch {}
    });
  }

  if (introGate instanceof HTMLElement && introCanvas instanceof HTMLCanvasElement) {
    const iCtx = introCanvas.getContext("2d");
    let introOpen = false;
    let isDrawing = false;
    let introProgress = 0;
    const strokePts = [];
    const waterRings = [];

    const resizeIntro = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      introCanvas.width = window.innerWidth * dpr;
      introCanvas.height = window.innerHeight * dpr;
      iCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const closeIntroGate = () => {
      if (!introOpen) return;
      introOpen = false;
      try {
        window.sessionStorage.setItem("jrp:intro-seen", "1");
      } catch {}
      soundApi.pop();
      introGate.classList.add("is-exiting");
      window.setTimeout(() => {
        introGate.hidden = true;
        introGate.classList.remove("is-exiting");
      }, 650);
    };

    const openIntroGate = () => {
      introProgress = 0;
      strokePts.length = 0;
      waterRings.length = 0;
      introGate.style.setProperty("--intro-progress", "0");
      if (introStatusEl) introStatusEl.textContent = "Draw an “A” on the water to enter";
      if (introPctEl) introPctEl.textContent = "Drag across the glyph · 0%";
      introGate.hidden = false;
      introGate.classList.remove("is-exiting");
      introOpen = true;
      resizeIntro();
    };

    window.addEventListener("resize", () => {
      if (introOpen) resizeIntro();
    });

    const addGesturePoint = (x, y) => {
      strokePts.push({ x, y, life: 1 });
      if (strokePts.length > 64) strokePts.shift();
      waterRings.push({ x, y, r: 6, alpha: 0.55 });
      if (waterRings.length > 18) waterRings.shift();

      // Accumulate gesture travel distance toward completing the "A" stroke
      if (strokePts.length > 1) {
        const prev = strokePts[strokePts.length - 2];
        const d = Math.hypot(x - prev.x, y - prev.y);
        introProgress = Math.min(1, introProgress + d / 340);
        introGate.style.setProperty("--intro-progress", introProgress.toFixed(3));
        const pct = Math.round(introProgress * 100);
        if (introPctEl) {
          introPctEl.textContent = `Water gesture · ${pct}%`;
        }
        if (Math.random() < 0.25) {
          soundApi.tick();
        }
        if (introProgress >= 1) {
          if (introStatusEl) introStatusEl.textContent = "Welcome in ↗";
          closeIntroGate();
        }
      }
    };

    introCanvas.addEventListener("pointerdown", (e) => {
      if (!introOpen) return;
      isDrawing = true;
      soundApi.unlock(true);
      soundApi.bubble();
      addGesturePoint(e.clientX, e.clientY);
    });

    window.addEventListener("pointermove", (e) => {
      if (!introOpen) return;
      if (isDrawing) {
        addGesturePoint(e.clientX, e.clientY);
      } else if (Math.random() < 0.12) {
        waterRings.push({ x: e.clientX, y: e.clientY, r: 4, alpha: 0.22 });
      }
    });

    window.addEventListener("pointerup", () => {
      isDrawing = false;
    });

    introSkipBtn?.addEventListener("click", () => {
      soundApi.unlock(false);
      closeIntroGate();
    });

    replayIntroBtn?.addEventListener("click", () => {
      openIntroGate();
    });

    window.addEventListener("keydown", (e) => {
      if (introOpen && (e.key === "Escape" || e.key === "Enter" || e.key === " ")) {
        closeIntroGate();
      }
    });

    const tickIntroCanvas = () => {
      if (introOpen && iCtx) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        iCtx.clearRect(0, 0, w, h);

        for (let i = waterRings.length - 1; i >= 0; i -= 1) {
          const rg = waterRings[i];
          rg.r += 2.8;
          rg.alpha *= 0.96;
          if (rg.alpha < 0.015) {
            waterRings.splice(i, 1);
            continue;
          }
          iCtx.beginPath();
          iCtx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
          iCtx.strokeStyle = `rgba(251, 146, 60, ${rg.alpha.toFixed(3)})`;
          iCtx.lineWidth = 1.5;
          iCtx.stroke();
        }

        if (strokePts.length > 1) {
          iCtx.beginPath();
          iCtx.moveTo(strokePts[0].x, strokePts[0].y);
          for (let i = 1; i < strokePts.length; i += 1) {
            iCtx.lineTo(strokePts[i].x, strokePts[i].y);
          }
          iCtx.strokeStyle = "#fb923c";
          iCtx.lineWidth = 6;
          iCtx.lineCap = "round";
          iCtx.lineJoin = "round";
          iCtx.stroke();
        }
      }
      window.requestAnimationFrame(tickIntroCanvas);
    };
    window.requestAnimationFrame(tickIntroCanvas);

    // Auto-open on first desktop visit if ?intro=1 or not yet seen in sessionStorage
    let seenIntro = false;
    try {
      seenIntro = window.sessionStorage.getItem("jrp:intro-seen") === "1";
    } catch {}
    if (
      urlSearchParams.has("intro")
      || (!seenIntro && !urlSearchParams.has("lite") && !urlSearchParams.has("game") && !urlSearchParams.has("resume") && window.innerWidth > 820 && isMotionAllowed())
    ) {
      openIntroGate();
    }
  }

  // 20. Interactive AI & Systems Architecture Memory Game (#modal-game) & Resume Print (#modal-resume)
  const gameGrid = document.querySelector("[data-game-grid]");
  const gameMovesEl = document.querySelector("[data-game-moves]");
  const gamePairsEl = document.querySelector("[data-game-pairs]");
  const gameTimeEl = document.querySelector("[data-game-time]");
  const gameBestEl = document.querySelector("[data-game-best]");
  const gameWinEl = document.querySelector("[data-game-win]");
  const gameWinMsg = document.querySelector("[data-game-win-msg]");
  const gameResetBtns = document.querySelectorAll("[data-game-reset], [data-game-play-again]");

  if (gameGrid instanceof HTMLElement) {
    const DECK_ITEMS = [
      { id: "risk", label: "Credit Risk", icon: "#icon-risk", color: "#d94826" },
      { id: "rag", label: "Visual RAG", icon: "#icon-rag", color: "#2945c4" },
      { id: "data", label: "Time Series", icon: "#icon-data", color: "#0d7a68" },
      { id: "api", label: "FastAPI", icon: "#icon-api", color: "#6d28d9" },
      { id: "cloud", label: "Kubernetes", icon: "#icon-cloud", color: "#0d7a68" },
      { id: "ai", label: "Open LLMs", icon: "#icon-ai", color: "#d94826" },
      { id: "vision", label: "Vision OCR", icon: "#icon-vision", color: "#2945c4" },
      { id: "python", label: "Python ML", icon: "#icon-python", color: "#6d28d9" },
    ];

    const BEST_KEY = "jrp:memory-best-moves";
    let moves = 0;
    let matchedPairs = 0;
    let firstCard = null;
    let lockBoard = false;
    let startTime = 0;
    let timerId = 0;

    const loadBest = () => {
      try {
        const b = window.localStorage.getItem(BEST_KEY);
        if (gameBestEl) gameBestEl.textContent = b ? `${b} moves` : "—";
      } catch {}
    };

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    };

    const stopGameTimer = () => {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = 0;
      }
    };

    const startGameTimer = () => {
      if (timerId) return;
      startTime = Date.now();
      timerId = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (gameTimeEl) gameTimeEl.textContent = formatTime(elapsed);
      }, 500);
    };

    const initMemoryGame = () => {
      stopGameTimer();
      moves = 0;
      matchedPairs = 0;
      firstCard = null;
      lockBoard = false;
      if (gameMovesEl) gameMovesEl.textContent = "0";
      if (gamePairsEl) gamePairsEl.textContent = "0 / 8";
      if (gameTimeEl) gameTimeEl.textContent = "0:00";
      if (gameWinEl instanceof HTMLElement) gameWinEl.hidden = true;
      loadBest();

      const deck = [...DECK_ITEMS, ...DECK_ITEMS];
      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      gameGrid.replaceChildren();
      deck.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jrp-game__card";
        btn.dataset.cardId = item.id;
        btn.style.setProperty("--card-accent", item.color);
        btn.setAttribute("aria-label", `Architecture tile ${idx + 1}`);
        btn.innerHTML = `
          <span class="jrp-game__face jrp-game__face--front" aria-hidden="true">AS</span>
          <span class="jrp-game__face jrp-game__face--back">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="${item.icon}"/></svg>
            <strong>${item.label}</strong>
          </span>
        `;

        btn.addEventListener("click", () => {
          if (lockBoard || btn === firstCard || btn.classList.contains("is-matched")) return;
          if (moves === 0 && !firstCard) startGameTimer();
          btn.classList.add("is-flipped");
          soundApi.tick();

          if (!firstCard) {
            firstCard = btn;
            return;
          }

          moves += 1;
          if (gameMovesEl) gameMovesEl.textContent = String(moves);

          if (firstCard.dataset.cardId === btn.dataset.cardId) {
            firstCard.classList.add("is-matched");
            btn.classList.add("is-matched");
            firstCard = null;
            matchedPairs += 1;
            if (gamePairsEl) gamePairsEl.textContent = `${matchedPairs} / 8`;
            soundApi.bubble();

            if (matchedPairs === DECK_ITEMS.length) {
              stopGameTimer();
              soundApi.pop();
              const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
              if (gameWinMsg) {
                gameWinMsg.textContent = `Stack deployed in ${moves} moves (${formatTime(elapsed)})!`;
              }
              if (gameWinEl instanceof HTMLElement) gameWinEl.hidden = false;
              try {
                const prevBest = Number(window.localStorage.getItem(BEST_KEY)) || 999;
                if (moves < prevBest) {
                  window.localStorage.setItem(BEST_KEY, String(moves));
                  loadBest();
                }
              } catch {}
            }
          } else {
            lockBoard = true;
            const prev = firstCard;
            firstCard = null;
            window.setTimeout(() => {
              prev.classList.remove("is-flipped");
              btn.classList.remove("is-flipped");
              lockBoard = false;
            }, 680);
          }
        });

        gameGrid.appendChild(btn);
      });
    };

    gameResetBtns.forEach((b) =>
      b.addEventListener("click", () => {
        soundApi.bubble();
        initMemoryGame();
      }),
    );

    initMemoryGame();
  }

  // Print / Save PDF handler inside #modal-resume
  const resumePrintBtn = document.querySelector("[data-resume-print]");
  resumePrintBtn?.addEventListener("click", () => {
    window.print();
  });

  // Support ?game=1 or ?resume=1 deep-links from case study pages
  if (urlSearchParams.has("game")) {
    const gModal = document.getElementById("modal-game");
    if (gModal instanceof HTMLDialogElement && !gModal.open) gModal.showModal();
  } else if (urlSearchParams.has("resume")) {
    const rModal = document.getElementById("modal-resume");
    if (rModal instanceof HTMLDialogElement && !rModal.open) rModal.showModal();
  }

  // 21. Case Study Pages: Interactive Data Projection Switchers & Animated KPI/Signal Bars
  const projSwitchers = document.querySelectorAll("[data-proj-switcher]");
  projSwitchers.forEach((switcher) => {
    const tabs = Array.from(switcher.querySelectorAll("[data-proj-tab]"));
    const panes = Array.from(switcher.querySelectorAll("[data-proj-pane]"));

    const activateProjTab = (targetKey, withSound = true) => {
      tabs.forEach((tab) => {
        const active = tab.getAttribute("data-proj-tab") === targetKey;
        tab.setAttribute("aria-selected", String(active));
      });
      panes.forEach((pane) => {
        const active = pane.getAttribute("data-proj-pane") === targetKey;
        pane.hidden = !active;
        if (active) {
          pane.querySelectorAll("[data-bar-pct]").forEach((bar) => {
            if (bar instanceof HTMLElement) {
              bar.style.setProperty("--bar-pct", "0%");
              void bar.offsetWidth;
              bar.style.setProperty("--bar-pct", `${bar.getAttribute("data-bar-pct")}%`);
            }
          });
        }
      });
      if (withSound) soundApi.drop();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.getAttribute("data-proj-tab");
        if (key) activateProjTab(key, true);
      });
    });
  });

  const allProjBars = document.querySelectorAll("[data-bar-pct]");
  if (allProjBars.length > 0 && "IntersectionObserver" in window) {
    const barObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const pct = entry.target.getAttribute("data-bar-pct") ?? "100";
            entry.target.style.setProperty("--bar-pct", `${pct}%`);
          }
        });
      },
      { threshold: 0.15 },
    );
    allProjBars.forEach((b) => barObs.observe(b));
  } else {
    allProjBars.forEach((b) => {
      if (b instanceof HTMLElement) {
        b.style.setProperty("--bar-pct", `${b.getAttribute("data-bar-pct") ?? "100"}%`);
      }
    });
  }
}
