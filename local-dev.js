/* Local-only safeguards. Keep production forms from submitting while prototyping. */
document.addEventListener('submit', (event) => {
  event.preventDefault();
  console.info('[local prototype] Form submission blocked.');
}, true);

/* href="#" is used as a JS trigger on the production site. Prevent accidental navigation
   if the corresponding production handler is not available locally. */
document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[href="#"]');
  if (link) event.preventDefault();
}, true);

/* Keep horizontal swipes inside the new hero facts row from switching hero slides. */
document.querySelectorAll('.hero-local-facts').forEach((factsRow) => {
  const heroSwiperElement = factsRow.closest('.js-hero-slider')?.querySelector('.swiper');
  const setHeroSwipe = (isEnabled) => {
    if (heroSwiperElement?.swiper) {
      heroSwiperElement.swiper.allowTouchMove = isEnabled;
    }
  };

  ['touchstart', 'pointerdown', 'mousedown'].forEach((eventName) => {
    factsRow.addEventListener(eventName, (event) => {
      setHeroSwipe(false);
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, { passive: true });
  });

  ['touchmove', 'pointermove', 'mousemove'].forEach((eventName) => {
    factsRow.addEventListener(eventName, (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, { passive: true });
  });

  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach((eventName) => {
    factsRow.addEventListener(eventName, () => {
      setHeroSwipe(true);
    }, { passive: true });
  });
});

(() => {
  const searchInput = document.querySelector('.js-prices-search');
  const group = document.querySelector('.group-prices-services');
  if (!searchInput || !group) return;

  const clearButton = document.querySelector('.js-prices-search-clear');
  const result = document.querySelector('.js-prices-search-result');
  const accordions = Array.from(group.querySelectorAll('.prices-services-accordion'));
  const normalize = (value) => value.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();

  const setResultText = (count, query) => {
    if (!result) return;
    if (!query) {
      result.hidden = true;
      result.textContent = '';
      return;
    }
    result.hidden = false;
    result.textContent = count ? `Найдено услуг: ${count}` : 'По вашему запросу услуги не найдены.';
  };

  const filterPrices = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;
    if (clearButton) clearButton.hidden = !query;

    accordions.forEach((accordion) => {
      const items = Array.from(accordion.querySelectorAll('.prices__item'));
      const itemMatchFlags = items.map((item) => normalize(item.textContent || '').includes(query));
      let groupVisibleCount = 0;

      items.forEach((item, index) => {
        const isVisible = !query || itemMatchFlags[index];
        item.hidden = !isVisible;
        if (isVisible) {
          groupVisibleCount += 1;
          if (query) visibleCount += 1;
        }
      });

      accordion.hidden = Boolean(query) && groupVisibleCount === 0;
    });

    setResultText(visibleCount, query);
  };

  searchInput.addEventListener('input', filterPrices);
  clearButton?.addEventListener('click', () => {
    searchInput.value = '';
    filterPrices();
    searchInput.focus();
  });
})();

(() => {
  const contents = document.querySelector('.page-contents');
  if (!contents) return;

  const details = contents.querySelector('.page-contents__details');
  const links = Array.from(contents.querySelectorAll('.page-contents__link'));
  const mobileQuery = window.matchMedia('(max-width: 767px)');

  const setDefaultState = () => {
    details.open = !mobileQuery.matches;
  };

  const setActiveLink = (activeLink) => {
    links.forEach((link) => link.classList.toggle('is-active', link === activeLink));
  };

  setDefaultState();
  mobileQuery.addEventListener?.('change', setDefaultState);

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      setActiveLink(link);
      if (mobileQuery.matches) details.open = false;

      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
      window.history.replaceState(
        null,
        '',
        `${window.location.origin}${window.location.pathname}${window.location.search}${link.getAttribute('href')}`
      );
    });
  });
})();

(() => {
  const routeButton = document.querySelector('.js-build-route');
  const openButton = document.querySelector('.js-routes-modal-open');
  const modal = document.querySelector('#routes-modal');

  routeButton?.addEventListener('click', () => {
    const endPoint = routeButton.dataset.endPoint;
    if (!endPoint) return;
    const routeUrl = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(endPoint)}&rtt=auto`;
    window.open(routeUrl, '_blank', 'noopener,noreferrer');
  });

  if (!openButton || !modal) return;

  const dialog = modal.querySelector('.routes-modal__dialog');
  const closeButtons = modal.querySelectorAll('.js-routes-modal-close');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('routes-modal-lock');
    openButton.focus();
  };

  openButton.addEventListener('click', () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('routes-modal-lock');
    requestAnimationFrame(() => dialog?.focus());
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const openButtons = document.querySelectorAll('.js-patient-result-form-open');
  const modal = document.querySelector('#patient-result-modal');
  if (!openButtons.length || !modal) return;

  const dialog = modal.querySelector('.patient-result-modal__dialog');
  const closeButtons = modal.querySelectorAll('.js-patient-result-form-close');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastActiveElement = null;

  const openModal = (trigger) => {
    lastActiveElement = trigger || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('patient-result-modal-lock');
    requestAnimationFrame(() => dialog?.focus());
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('patient-result-modal-lock');
    lastActiveElement?.focus?.();
  };

  const trapFocus = (event) => {
    if (!modal.classList.contains('is-open') || event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(event.currentTarget);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  modal.querySelectorAll('.patient-result-form').forEach((form) => {
    const fileInput = form.querySelector('input[type="file"][name="photo"]');
    const fileText = form.querySelector('.patient-result-form__file-text');
    const preview = form.querySelector('.js-patient-result-file-preview');
    const previewImage = preview?.querySelector('img');
    const previewName = preview?.querySelector('.js-patient-result-file-name');
    const removeButton = preview?.querySelector('.js-patient-result-file-remove');
    const initialFileText = fileText?.textContent || 'JPG, PNG до 10 МБ';
    let previewUrl = null;

    const clearPreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
      if (fileInput) fileInput.value = '';
      if (fileText) fileText.textContent = initialFileText;
      if (previewImage) previewImage.removeAttribute('src');
      if (previewName) previewName.textContent = '';
      if (preview) preview.hidden = true;
    };

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) {
        clearPreview();
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      if (fileText) fileText.textContent = file.name;
      if (previewName) previewName.textContent = file.name;
      if (previewImage) {
        if (previewUrl) {
          previewImage.src = previewUrl;
          previewImage.hidden = false;
        } else {
          previewImage.removeAttribute('src');
          previewImage.hidden = true;
        }
      }
      if (preview) preview.hidden = false;
    });

    removeButton?.addEventListener('click', clearPreview);
    form.addEventListener('reset', clearPreview);
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    trapFocus(event);
  });
})();

(() => {
  const openButtons = document.querySelectorAll('.js-operation-price-open');
  const modal = document.querySelector('#operation-price-modal');
  if (!openButtons.length || !modal) return;

  const dialog = modal.querySelector('.operation-price-modal__dialog');
  const closeButtons = modal.querySelectorAll('.js-operation-price-close');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastActiveElement = null;

  const openModal = (trigger) => {
    lastActiveElement = trigger || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('operation-price-modal-lock');
    requestAnimationFrame(() => dialog?.focus());
  };

  const closeModal = () => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('operation-price-modal-lock');
    lastActiveElement?.focus?.();
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(event.currentTarget);
    });
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(modal.querySelectorAll(focusableSelector))
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const openButton = document.querySelector('.js-installment-modal-open');
  const modal = document.querySelector('#installment-modal');
  if (!openButton || !modal) return;

  const dialog = modal.querySelector('.installment-modal__dialog');
  const closeButtons = modal.querySelectorAll('.js-installment-modal-close');
  const form = modal.querySelector('.js-installment-form');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('installment-modal-lock');
    openButton.focus();
  };

  openButton.addEventListener('click', (event) => {
    event.preventDefault();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('installment-modal-lock');
    requestAnimationFrame(() => dialog?.focus());
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) form.reportValidity();
  });
})();

(() => {
  const cards = Array.from(document.querySelectorAll('.prices-payment-card'));
  if (!cards.length) return;

  if (window.matchMedia('(max-width: 767px)').matches) {
    cards.forEach((card) => {
      card.classList.remove('is-open');
      card.querySelector('.prices-payment-card__head')?.setAttribute('aria-expanded', 'false');
    });
  }

  cards.forEach((card) => {
    const button = card.querySelector('.prices-payment-card__head');
    if (!button) return;

    card.querySelectorAll('.prices-payment-card__title-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    button.addEventListener('click', () => {
      const isOpen = card.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });
})();

(() => {
  const openButtons = document.querySelectorAll('.js-operation-quiz-open');
  const modal = document.querySelector('#operation-quiz-modal');
  if (!openButtons.length || !modal) return;
  window.__operationQuizReady = true;

  const dialog = modal.querySelector('.operation-quiz-modal__dialog');
  const screen = modal.querySelector('.js-operation-quiz-screen');
  const progressText = modal.querySelector('.js-operation-quiz-progress-text');
  const progressBar = modal.querySelector('.js-operation-quiz-progress-bar');
  const backButton = modal.querySelector('.js-operation-quiz-back');
  const nextButton = modal.querySelector('.js-operation-quiz-next');
  const actions = modal.querySelector('.operation-quiz__actions');
  const resultBlock = modal.querySelector('.js-operation-quiz-result');
  const resultTitle = modal.querySelector('.js-operation-quiz-result-title');
  const form = modal.querySelector('.js-operation-quiz-form');
  const formMessage = modal.querySelector('.js-operation-quiz-form-message');
  const thanks = modal.querySelector('.js-operation-quiz-thanks');
  const hidden = {
    zone: modal.querySelector('.js-operation-quiz-hidden-zone'),
    detail: modal.querySelector('.js-operation-quiz-hidden-detail'),
    timing: modal.querySelector('.js-operation-quiz-hidden-timing'),
    custom: modal.querySelector('.js-operation-quiz-hidden-custom'),
    result: modal.querySelector('.js-operation-quiz-hidden-result'),
    url: modal.querySelector('.js-operation-quiz-hidden-url'),
    utmSource: modal.querySelector('.js-operation-quiz-hidden-utm-source'),
    utmMedium: modal.querySelector('.js-operation-quiz-hidden-utm-medium'),
    utmCampaign: modal.querySelector('.js-operation-quiz-hidden-utm-campaign'),
    utmContent: modal.querySelector('.js-operation-quiz-hidden-utm-content'),
    utmTerm: modal.querySelector('.js-operation-quiz-hidden-utm-term')
  };

  const quizData = {
    zones: [
      { id: 'face', label: 'Лицо и веки' },
      { id: 'breast', label: 'Грудь' },
      { id: 'body', label: 'Живот и контуры тела' },
      { id: 'scars', label: 'Рубцы' },
      { id: 'unknown', label: 'Пока не могу определиться' }
    ],
    details: {
      face: {
        title: 'Что вас беспокоит больше всего?',
        options: [
          { id: 'upper_eyelids', label: 'нависание верхних век' },
          { id: 'lower_eyelids', label: 'мешки или избыток кожи под глазами' },
          { id: 'round_eyelids', label: 'изменения верхних и нижних век' },
          { id: 'face_neck_lift', label: 'опущение тканей лица и шеи' },
          { id: 'endo_face', label: 'возрастные изменения верхней или средней трети лица' },
          { id: 'unsure', label: 'пока не знаю, какой вариант мне нужен' }
        ]
      },
      breast: {
        title: 'Какого изменения вы хотите добиться?',
        options: [
          { id: 'breast_augmentation', label: 'увеличить объем груди' },
          { id: 'breast_lift', label: 'подтянуть грудь и улучшить форму' },
          { id: 'breast_reduction', label: 'уменьшить объем груди' },
          { id: 'breast_asymmetry', label: 'скорректировать асимметрию' },
          { id: 'breast_restore', label: 'восстановить форму после беременности или снижения веса' },
          { id: 'unsure', label: 'пока не знаю, какой вариант мне нужен' }
        ]
      },
      body: {
        title: 'Какая задача для вас наиболее актуальна?',
        options: [
          { id: 'abdominoplasty', label: 'убрать избыток кожи в области живота' },
          { id: 'liposuction', label: 'скорректировать локальные жировые отложения' },
          { id: 'body_contours', label: 'сделать контуры тела более пропорциональными' },
          { id: 'body_after_weight', label: 'восстановить область живота после беременности или снижения веса' },
          { id: 'body_complex', label: 'требуется комплексная коррекция' },
          { id: 'unsure', label: 'пока не знаю, какой вариант мне нужен' }
        ]
      },
      scars: {
        title: 'Какой результат вы хотели бы получить?',
        options: [
          { id: 'scar_less_visible', label: 'сделать рубец менее заметным' },
          { id: 'scar_shape', label: 'скорректировать форму или расположение рубца' },
          { id: 'scar_discomfort', label: 'устранить дискомфорт или стягивание тканей' },
          { id: 'scar_consultation', label: 'хочу сначала получить консультацию врача' }
        ]
      },
      unknown: {
        title: 'Что вы хотели бы обсудить с врачом?',
        options: [
          { id: 'unknown_face', label: 'возрастные изменения лица' },
          { id: 'unknown_breast', label: 'форму или объем груди' },
          { id: 'unknown_body', label: 'живот и контуры тела' },
          { id: 'unknown_scars', label: 'рубцы' },
          { id: 'unknown_multiple', label: 'несколько зон', hasText: true },
          { id: 'unknown_custom', label: 'хочу описать задачу своими словами', hasText: true }
        ]
      }
    },
    timing: [
      { id: 'soon', label: 'в ближайшее время' },
      { id: 'one_three_months', label: 'в течение 1–3 месяцев' },
      { id: 'later', label: 'позднее' },
      { id: 'research', label: 'пока только изучаю возможности' }
    ],
    results: {
      upper_eyelids: 'верхняя блефаропластика',
      lower_eyelids: 'нижняя блефаропластика',
      round_eyelids: 'круговая блефаропластика',
      face_neck_lift: 'подтяжка лица и шеи / SMAS-лифтинг',
      endo_face: 'эндоскопическое омоложение лица',
      breast_augmentation: 'увеличение груди',
      breast_lift: 'подтяжка груди',
      breast_restore: 'подтяжка груди',
      breast_reduction: 'уменьшение груди',
      breast_asymmetry: 'индивидуальная коррекция асимметрии',
      abdominoplasty: 'абдоминопластика',
      liposuction: 'липосакция',
      body_contours: 'липомоделирование или комплексная коррекция тела',
      body_after_weight: 'липомоделирование или комплексная коррекция тела',
      body_complex: 'липомоделирование или комплексная коррекция тела',
      scar_less_visible: 'хирургическая коррекция рубцов',
      scar_shape: 'хирургическая коррекция рубцов',
      scar_discomfort: 'хирургическая коррекция рубцов',
      scar_consultation: 'хирургическая коррекция рубцов',
      unknown_scars: 'хирургическая коррекция рубцов'
    },
    consultationResult: 'очная консультация пластического хирурга'
  };

  let currentStep = 0;
  let lastActiveElement = null;
  const answers = {
    zone: '',
    detail: '',
    timing: '',
    customText: '',
    result: ''
  };

  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const getParams = () => new URLSearchParams(window.location.search);
  const getLabel = (items, id) => items.find((item) => item.id === id)?.label || '';
  const getSelectedZone = () => quizData.zones.find((item) => item.id === answers.zone);
  const getDetailGroup = () => quizData.details[answers.zone] || quizData.details.unknown;
  const shouldShowCustomText = () => getDetailGroup().options.some((option) => option.id === answers.detail && option.hasText);
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));

  const emitQuizEvent = (name, detail = {}) => {
    const safeDetail = { ...detail };
    window.dispatchEvent(new CustomEvent(name, { detail: safeDetail }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...safeDetail });
    }
  };

  const renderOption = (option, selectedValue, answerKey) => (
    `<button class="operation-quiz-option${selectedValue === option.id ? ' is-selected' : ''}" type="button" data-answer-key="${answerKey}" data-answer-value="${option.id}" aria-pressed="${selectedValue === option.id ? 'true' : 'false'}">
      <span class="operation-quiz-option__text">${option.label}</span>
    </button>`
  );

  const renderStep = () => {
    resultBlock.hidden = true;
    thanks.hidden = true;
    screen.hidden = false;
    actions.hidden = false;
    backButton.hidden = currentStep === 0;
    nextButton.querySelector('.button__text').textContent = currentStep === 2 ? 'Показать результат' : 'Далее';

    if (currentStep === 0) {
      screen.innerHTML = `
        <div class="operation-quiz-step">
          <h3 class="operation-quiz-step__title">Что вы хотели бы изменить?</h3>
          <div class="operation-quiz-options" role="radiogroup" aria-label="Зона коррекции">
            ${quizData.zones.map((option) => renderOption(option, answers.zone, 'zone')).join('')}
          </div>
        </div>
      `;
    }

    if (currentStep === 1) {
      const detailGroup = getDetailGroup();
      screen.innerHTML = `
        <div class="operation-quiz-step">
          <h3 class="operation-quiz-step__title">${detailGroup.title}</h3>
          <div class="operation-quiz-options" role="radiogroup" aria-label="${detailGroup.title}">
            ${detailGroup.options.map((option) => renderOption(option, answers.detail, 'detail')).join('')}
          </div>
          <div class="operation-quiz-custom js-operation-quiz-custom" ${shouldShowCustomText() ? '' : 'hidden'}>
            <label for="operation-quiz-custom-text">Расскажите, что вы хотели бы изменить</label>
            <textarea id="operation-quiz-custom-text" maxlength="500">${escapeHtml(answers.customText)}</textarea>
          </div>
        </div>
      `;
    }

    if (currentStep === 2) {
      screen.innerHTML = `
        <div class="operation-quiz-step">
          <h3 class="operation-quiz-step__title">Когда вы планируете обратиться к пластическому хирургу?</h3>
          <div class="operation-quiz-options" role="radiogroup" aria-label="Планируемый срок обращения">
            ${quizData.timing.map((option) => renderOption(option, answers.timing, 'timing')).join('')}
          </div>
        </div>
      `;
    }

    updateProgress();
    updateNextState();
    bindStepEvents();
  };

  const updateProgress = () => {
    const stepNumber = currentStep + 1;
    progressText.textContent = `Шаг ${stepNumber} из 3`;
    progressBar.style.width = `${(stepNumber / 3) * 100}%`;
  };

  const updateNextState = () => {
    const hasAnswer = currentStep === 0 ? Boolean(answers.zone) : currentStep === 1 ? Boolean(answers.detail) : Boolean(answers.timing);
    nextButton.disabled = !hasAnswer;
  };

  const bindStepEvents = () => {
    screen.querySelectorAll('.operation-quiz-option').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.answerKey;
        answers[key] = button.dataset.answerValue;
        if (key === 'zone') {
          answers.detail = '';
          answers.customText = '';
        }
        if (key === 'detail' && !shouldShowCustomText()) {
          answers.customText = '';
        }
        renderStep();
      });
    });

    const customText = screen.querySelector('#operation-quiz-custom-text');
    if (customText) {
      customText.addEventListener('input', () => {
        answers.customText = customText.value.slice(0, 500);
      });
    }
  };

  const calculateResult = () => {
    const detail = answers.detail;
    if (!detail || detail === 'unsure' || answers.zone === 'unknown') {
      if (detail === 'unknown_scars') return quizData.results.unknown_scars;
      return quizData.consultationResult;
    }
    return quizData.results[detail] || quizData.consultationResult;
  };

  const setHiddenFields = () => {
    const params = getParams();
    const detailGroup = getDetailGroup();
    hidden.zone.value = getLabel(quizData.zones, answers.zone);
    hidden.detail.value = getLabel(detailGroup.options, answers.detail);
    hidden.timing.value = getLabel(quizData.timing, answers.timing);
    hidden.custom.value = answers.customText;
    hidden.result.value = answers.result;
    hidden.url.value = window.location.href;
    hidden.utmSource.value = params.get('utm_source') || '';
    hidden.utmMedium.value = params.get('utm_medium') || '';
    hidden.utmCampaign.value = params.get('utm_campaign') || '';
    hidden.utmContent.value = params.get('utm_content') || '';
    hidden.utmTerm.value = params.get('utm_term') || '';
  };

  const showResult = () => {
    answers.result = calculateResult();
    setHiddenFields();
    modal.classList.add('is-result');
    screen.hidden = true;
    actions.hidden = true;
    resultBlock.hidden = false;
    resultTitle.textContent = `Возможно, вам подойдет: ${answers.result}`;
    emitQuizEvent('quiz_result_view', { result: answers.result });
    resultBlock.querySelector('input, textarea, button, a')?.focus();
  };

  const resetQuiz = () => {
    currentStep = 0;
    answers.zone = '';
    answers.detail = '';
    answers.timing = '';
    answers.customText = '';
    answers.result = '';
    modal.classList.remove('is-result');
    form.reset();
    formMessage.textContent = '';
    renderStep();
  };

  const openQuiz = (triggerElement) => {
    lastActiveElement = triggerElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('operation-quiz-lock');
    resetQuiz();
    emitQuizEvent('quiz_open');
    requestAnimationFrame(() => dialog.focus());
  };

  const closeQuiz = () => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('operation-quiz-lock');
    emitQuizEvent('quiz_close');
    lastActiveElement?.focus();
  };

  const handleKeydown = (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeQuiz();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('click', (event) => {
    const openButton = event.target.closest?.('.js-operation-quiz-open');
    if (!openButton) return;
    event.preventDefault();
    event.stopPropagation();
    openQuiz(openButton);
  }, true);

  openButtons.forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    openQuiz(event.currentTarget);
  }));
  modal.querySelectorAll('.js-operation-quiz-close').forEach((button) => {
    button.addEventListener('click', closeQuiz);
  });
  document.addEventListener('keydown', handleKeydown);

  backButton.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
      screen.querySelector('.operation-quiz-option')?.focus();
    }
  });

  nextButton.addEventListener('click', () => {
    if (nextButton.disabled) return;
    emitQuizEvent('quiz_step_complete', { step: currentStep + 1 });
    if (currentStep < 2) {
      currentStep += 1;
      renderStep();
      screen.querySelector('.operation-quiz-option')?.focus();
    } else {
      showResult();
    }
  });

  form.addEventListener('submit', (event) => {
    formMessage.textContent = '';
    setHiddenFields();
    emitQuizEvent('quiz_form_submit');
    if (!form.checkValidity()) {
      event.preventDefault();
      formMessage.textContent = 'Пожалуйста, заполните обязательные поля и подтвердите согласие.';
      form.reportValidity();
      return;
    }
    event.preventDefault();
    resultBlock.hidden = true;
    thanks.hidden = false;
    emitQuizEvent('quiz_form_success');
    thanks.querySelector('button')?.focus();
  });
})();

(() => {
  const galleries = document.querySelectorAll('[data-case-example-gallery]');
  if (!galleries.length) return;

  let activeItems = [];
  let activeIndex = 0;
  let lastActiveElement = null;

  const lightbox = document.createElement('div');
  lightbox.className = 'case-example-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Просмотр фотографии');
  lightbox.innerHTML = `
    <button class="case-example-lightbox__button case-example-lightbox__close" type="button" aria-label="Закрыть просмотр">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <button class="case-example-lightbox__button case-example-lightbox__prev" type="button" aria-label="Предыдущее фото">
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <img class="case-example-lightbox__image" src="" alt="">
    <button class="case-example-lightbox__button case-example-lightbox__next" type="button" aria-label="Следующее фото">
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector('.case-example-lightbox__image');
  const closeButton = lightbox.querySelector('.case-example-lightbox__close');
  const prevButton = lightbox.querySelector('.case-example-lightbox__prev');
  const nextButton = lightbox.querySelector('.case-example-lightbox__next');

  const showImage = (index) => {
    if (!activeItems.length) return;
    activeIndex = (index + activeItems.length) % activeItems.length;
    const item = activeItems[activeIndex];
    image.src = item.dataset.src || item.querySelector('img')?.src || '';
    image.alt = item.querySelector('img')?.alt || 'Фото результата';
  };

  const openLightbox = (items, index, trigger) => {
    activeItems = items;
    lastActiveElement = trigger;
    showImage(index);
    lightbox.classList.add('is-open');
    document.body.classList.add('case-example-lightbox-lock');
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('case-example-lightbox-lock');
    image.removeAttribute('src');
    lastActiveElement?.focus();
  };

  galleries.forEach((gallery) => {
    const viewport = gallery.querySelector('.case-example-gallery__viewport');
    const items = Array.from(gallery.querySelectorAll('[data-case-example-gallery-item]'));
    const prevGalleryButton = gallery.querySelector('[data-case-example-gallery-prev]');
    const nextGalleryButton = gallery.querySelector('[data-case-example-gallery-next]');

    items.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(items, index, item));
    });

    prevGalleryButton?.addEventListener('click', () => {
      viewport?.scrollBy({ left: -Math.max(280, viewport.clientWidth * 0.8), behavior: 'smooth' });
    });

    nextGalleryButton?.addEventListener('click', () => {
      viewport?.scrollBy({ left: Math.max(280, viewport.clientWidth * 0.8), behavior: 'smooth' });
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton.addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });
})();
