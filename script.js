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
    motionToggle.textContent = enabled ? "Motion on · turn off" : "Enable motion";

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

const workFilters = document.querySelectorAll(".work-filter");
const projectCards = document.querySelectorAll(".project-card[data-categories]");
const workCount = document.querySelector("#work-count");

if (workFilters.length > 0 && projectCards.length > 0 && workCount) {
  workFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const selectedCategory = filter.dataset.filter;
      let visibleCount = 0;

      workFilters.forEach((button) => {
        const isActive = button === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const categories = card.dataset.categories?.split(/\s+/) ?? [];
        const shouldShow = selectedCategory === "all" || categories.includes(selectedCategory ?? "");
        card.hidden = !shouldShow;
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      workCount.textContent = selectedCategory === "all"
        ? `Showing all ${visibleCount} work highlights`
        : `Showing ${visibleCount} ${visibleCount === 1 ? "work highlight" : "work highlights"}`;
    });
  });
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

const systemMap = document.querySelector(".system-map");
const systemNodes = systemMap?.querySelectorAll(".map-node[data-explorer-title][data-explorer-detail]");
const outcomeTitle = systemMap?.querySelector(".outcome-title");
const outcomeDetail = systemMap?.querySelector(".outcome-detail");

if (systemMap && systemNodes?.length && outcomeTitle && outcomeDetail) {
  const defaultTitle = outcomeTitle.textContent;
  const defaultDetail = outcomeDetail.textContent;
  let focusedNode = null;
  let hoveredNode = null;

  const updateNodeDetails = () => {
    const activeNode = focusedNode ?? hoveredNode;
    systemNodes.forEach((node) => node.classList.toggle("is-selected", node === activeNode));
    outcomeTitle.textContent = activeNode?.dataset.explorerTitle ?? defaultTitle;
    outcomeDetail.textContent = activeNode?.dataset.explorerDetail ?? defaultDetail;
  };

  systemNodes.forEach((node) => {
    node.addEventListener("pointerenter", () => {
      hoveredNode = node;
      updateNodeDetails();
    });
    node.addEventListener("focus", () => {
      focusedNode = node;
      updateNodeDetails();
    });
  });

  systemMap.addEventListener("pointerleave", () => {
    hoveredNode = null;
    updateNodeDetails();
  });
  systemMap.addEventListener("focusout", (event) => {
    if (!systemMap.contains(event.relatedTarget)) {
      focusedNode = null;
      updateNodeDetails();
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".hero-copy, .system-card, .proof-inner > p, .section-heading, .project-card, .expertise-card, .process-list li, .timeline-entry, .education-card, .recognition-items > p, .case-hero-art, .case-meta-grid, .case-flow .flow-step, .case-article section",
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
    }
  }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });

  caseSections.forEach((section) => caseSectionObserver.observe(section));
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
