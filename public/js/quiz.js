(() => {
  const root = document.getElementById("quizRoot");
  if (!root) return;
  const feelMeAudio = document.getElementById("feelMeAudio");
  const feelMeBtn = document.getElementById("feelMeBtn");

  const LOCAL_QUIZ = {
    title: "Mayank ❤ Gunjan — Love Quiz",
    correctReply: "aww mera gunna",
    incorrectReply: "huhhh",
    questions: [
      {
        id: "q1",
        question: "Who has my whole heart?",
        options: ["Pizza", "Gunjan", "My phone", "Sleep"],
        answerIndex: 1,
      },
      {
        id: "q2",
        question: "What’s our love language in one word?",
        options: ["Ego", "Care", "Drama", "Silence"],
        answerIndex: 0,
      },
      {
        id: "q3",
        question: "If I’m upset, what fixes it fastest?",
        options: ["no text for an week", "Instaant text of gunna", "Your hug", "Blocking Gunna"],
        answerIndex: 1,
      },
      {
        id: "q4",
        question: "What’s the cutest nickname vibe for you?",
        options: ["Gurugram", "Gunna", "addu,paddu", "Hunter"],
        answerIndex: 2,
      },
      {
        id: "q5",
        question: "Our best kind of date is…",
        options: ["Only selfies", "Long drive + music", "Just shopping list", "Awkward silence"],
        answerIndex: 1,
      },
      {
        id: "q6",
        question: "What do I want with you forever?",
        options: ["Just Faxxx", "Only reels", "Us", "Only gifts"],
        answerIndex: 0,
      },
      {
        id: "q7",
        question: "When I say “I love you”, I really mean…",
        options: ["I’m sleepy", "I choose you, every day", "I need your nudes", "I’m bored"],
        answerIndex: 2,
      },
      {
        id: "q8",
        question: "Pick the real flex of our relationship:",
        options: ["We compete", "We stay, we grow", "We fight daily", "We ghost"],
        answerIndex: 1,
      },
      {
        id: "q9",
        question: "What’s my favorite notification?",
        options: ["App updates", "Random ads", "Your message", "Bank spam"],
        answerIndex: 2,
      },
      {
        id: "q10",
        question: "Which song should we play when we miss each other?",
        options: ["Feel Me", "Your voice note", "Silence", "Random playlist"],
        answerIndex: 0,
      },
    ],
  };

  const FEEL_ME_LABEL = "feel me";
  const FEEL_ME_LOCAL = "./assets/music2.mp3";
  const FEEL_ME_SERVER = "/assets/music2.mp3";

  const state = {
    title: "Love Quiz",
    questions: [],
    index: 0,
    score: 0,
    answered: false,
    lastReply: null,
    lastCorrect: null,
    correctReply: "aww mera gunna",
    incorrectReply: "huhhh paddu paddu paddu",
    useLocal: false,
  };

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (typeof v === "boolean" && k in node) node[k] = v;
      else node.setAttribute(k, String(v));
    });
    for (const child of children) node.append(child);
    return node;
  }

  function isFeelMeOption(label) {
    return typeof label === "string" && /feel\s*me/i.test(label);
  }

  function render() {
    root.innerHTML = "";

    const total = state.questions.length || 10;
    const done = Math.min(state.index, total);

    const progress = el("div", { class: "progress card reveal" }, [
      el("div", { style: `width:${total ? (done / total) * 100 : 0}%` }),
    ]);

    if (!state.questions.length) {
      root.append(
        progress,
        el("div", { class: "card quiz-card reveal" }, [
          el("div", { class: "q-title", html: "Loading questions…" }),
          el("p", { class: "muted", html: "If this takes long, the server may not be running." }),
        ]),
      );
      return;
    }

    if (state.index >= total) {
      const summary = el("div", { class: "card final reveal" }, [
        el("h2", { html: "Quiz Complete 💘" }),
        el("div", { class: "score gradient-text", html: `${state.score}/${total}` }),
        el("p", {
          html:
            state.score === total
              ? "Perfect! aww mera gunna 😌"
              : "No worries… the correct answer is still love. Try again? 😤",
        }),
        el("div", { class: "actions" }, [
          el(
            "button",
            {
              class: "btn btn-primary",
              type: "button",
              onClick: () => {
                state.index = 0;
                state.score = 0;
                state.answered = false;
                state.lastReply = null;
                state.lastCorrect = null;
                render();
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
            },
            ["Restart Quiz"],
          ),
          el("a", { class: "btn", href: "favorite.html", "data-nav": "true" }, ["My Fav Thing"]),
          el("a", { class: "btn btn-ghost", href: "moments.html", "data-nav": "true" }, ["Best Moments"]),
        ]),
      ]);

      root.append(progress, summary);
      return;
    }

    const q = state.questions[state.index];

    const reply = el("div", {
      class: `reply ${state.lastReply ? "show" : ""} ${state.lastCorrect ? "good" : state.lastCorrect === false ? "bad" : ""}`,
      html: state.lastReply || "",
      "aria-live": "polite",
    });

    const nextBtn = el(
      "button",
      {
        class: "btn",
        type: "button",
        disabled: !state.answered,
        onClick: () => {
          state.index += 1;
          state.answered = false;
          state.lastReply = null;
          state.lastCorrect = null;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      ["Next"],
    );

    const options = el("div", { class: "options" });
    q.options.forEach((text, idx) => {
      const isFeelMe = isFeelMeOption(text);
      const btn = el(
        "button",
        {
          class: "opt",
          type: "button",
          onClick: () => {
            if (isFeelMe) playFeelMe();
            if (state.answered) return;
            submitAnswer(idx, text);
          },
        },
        [text],
      );
      if (isFeelMe) {
        btn.addEventListener(
          "pointerdown",
          () => {
            playFeelMe();
          },
          { passive: true },
        );
      }
      if (state.answered && !isFeelMe) btn.disabled = true;
      options.appendChild(btn);
    });

    const card = el("div", { class: `card quiz-card reveal ${state.lastCorrect ? "good" : state.lastCorrect === false ? "bad" : ""}` }, [
      el("div", { class: "q-meta" }, [
        el("div", { html: `Question <strong>${state.index + 1}</strong> / ${total}` }),
        el("div", { class: "pill", html: `Score: <strong>${state.score}</strong>` }),
      ]),
      el("div", { class: "q-title", html: q.question }),
      options,
      el("div", { class: "result" }, [reply, nextBtn]),
    ]);

    root.append(progress, card);

    // Let reveal observer pick it up even after dynamic render.
    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("is-visible"));
  }

  async function submitAnswer(optionIndex, optionLabel) {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.index];
    if (state.useLocal && Number.isInteger(q?.answerIndex)) {
      const isCorrect = optionIndex === q.answerIndex;
      state.lastCorrect = isCorrect;
      state.lastReply = isCorrect ? state.correctReply : state.incorrectReply;
      if (isCorrect) {
        state.score += 1;
        window.ValentineFX?.burst?.({ count: 18 });
        window.ValentineUI?.toast?.(state.correctReply, { kind: "good", title: "Correct" });
      } else {
        window.ValentineUI?.toast?.(state.incorrectReply, { kind: "bad", title: "Wrong" });
      }
      render();
      return;
    }

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: q.id, optionIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Answer check failed");

      state.lastCorrect = Boolean(data.correct);
      state.lastReply = String(data.reply || "");

      if (state.lastCorrect) {
        state.score += 1;
        window.ValentineFX?.burst?.({ count: 18 });
        window.ValentineUI?.toast?.("aww mera gunna", { kind: "good", title: "Correct" });
      } else {
        window.ValentineUI?.toast?.("huhhh", { kind: "bad", title: "Wrong" });
      }
    } catch (err) {
      const localMatch = LOCAL_QUIZ.questions.find((qq) => qq.id === q.id);
      if (localMatch && Number.isInteger(localMatch.answerIndex)) {
        const isCorrect = optionIndex === localMatch.answerIndex;
        state.lastCorrect = isCorrect;
        state.lastReply = isCorrect ? state.correctReply : state.incorrectReply;
        if (isCorrect) {
          state.score += 1;
          window.ValentineFX?.burst?.({ count: 18 });
          window.ValentineUI?.toast?.(state.correctReply, { kind: "good", title: "Correct" });
        } else {
          window.ValentineUI?.toast?.(state.incorrectReply, { kind: "bad", title: "Wrong" });
        }
      } else {
        state.lastCorrect = false;
        state.lastReply = state.incorrectReply;
        window.ValentineUI?.toast?.("Server not reachable. Start the server and refresh.", { kind: "bad", title: "Oops" });
      }
    }

    render();
  }

  async function load() {
    if (window.location.protocol === "file:") {
      state.useLocal = true;
      state.title = LOCAL_QUIZ.title;
      state.correctReply = LOCAL_QUIZ.correctReply;
      state.incorrectReply = LOCAL_QUIZ.incorrectReply;
      state.questions = LOCAL_QUIZ.questions;
      render();
      return;
    }

    try {
      const res = await fetch("/api/quiz");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load quiz");
      state.title = String(data.title || state.title);
      state.questions = Array.isArray(data.questions) ? data.questions : [];
      state.useLocal = false;
    } catch {
      state.useLocal = true;
      state.title = LOCAL_QUIZ.title;
      state.correctReply = LOCAL_QUIZ.correctReply;
      state.incorrectReply = LOCAL_QUIZ.incorrectReply;
      state.questions = LOCAL_QUIZ.questions;
    }
    render();
  }

  function initFeelMeAudio() {
    if (!feelMeAudio) return;
    feelMeAudio.src = window.location.protocol === "file:" ? FEEL_ME_LOCAL : FEEL_ME_SERVER;
    feelMeAudio.addEventListener("error", () => {
      window.ValentineUI?.toast?.("Add your song at public/assets/music2.mp3", { kind: "bad", title: "Music missing" });
    });
  }

  async function playFeelMe() {
    const src = window.location.protocol === "file:" ? FEEL_ME_LOCAL : FEEL_ME_SERVER;
    const audio = feelMeAudio || new Audio(src);
    if (audio.src !== src) audio.src = src;
    audio.volume = 0.9;
    try {
      audio.currentTime = 0;
      await audio.play();
      window.ValentineUI?.toast?.("Feel Me 🎵", { kind: "good", title: "Playing" });
    } catch {
      window.ValentineUI?.toast?.("Couldn’t play. Make sure music2.mp3 is in public/assets.", { kind: "bad", title: "Blocked" });
    }
  }

  render();
  initFeelMeAudio();
  load();

  feelMeBtn?.addEventListener("click", () => {
    playFeelMe();
  });

  feelMeBtn?.addEventListener(
    "pointerdown",
    () => {
      playFeelMe();
    },
    { passive: true },
  );
})();
