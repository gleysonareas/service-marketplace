function onLoadForm() {
  window.Menu = this;
  checkRedirectAfterAuth.call(this);
  observeMenuReady();
}

// Função que observa alterações na pagina para garantir o carregamento do DOM
function observeMenuReady() {
  const menuContainer = document.querySelector('.menu-main-box');
  if (!menuContainer) {
    // Tenta novamente após um curto período caso o container não esteja pronto
    setTimeout(observeMenuReady, 200);
    return;
  }

  const observer = new MutationObserver((mutations) => {
    // Elementos críticos que precisam estar presentes
    const criticalElements = [
      '.all-nav',
      '.menus',
      '.menus-direita',
      '.login-register-btns',
      '.logoff-btn-menu'
    ];

    // Verifica se todos os elementos existem
    const allElementsReady = criticalElements.every(selector =>
      menuContainer.querySelector(selector)
    );

    if (allElementsReady) {
      // Executa as funções necessárias
      setVisible();
      showAdminLink();

      // Para de observar após sucesso
      observer.disconnect();
    }
  });

  // Configuração do observador
  observer.observe(menuContainer, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  // Verificação inicial imediata
  const initialCheck = () => {
    const elementsExist = [
      '.all-nav',
      '.menus',
      '.menus-direita'
    ].every(selector => document.querySelector(selector));

    if (elementsExist) {
      setVisible();
      showAdminLink();
      observer.disconnect();
    }
  };

  // Executa a verificação inicial
  initialCheck();
}

// Obter tamanho da tela
function isMobile() {
  return window.innerWidth <= 700;
}

// Obter sessão
function getSession() {
  return window.Menu?.session || {};
}

window.openMenuPlace = function () {
  const menu = document.querySelector('.menus');
  const menuRight = document.querySelector('.menus-direita');
  const allMenuNav = document.querySelector('.all-nav');
  const iconbtn = document.querySelector('.icon-open-menu');

  if (allMenuNav.classList.contains('open-menu-all')) {
    menu.classList.remove('open-menu-place');
    menuRight.classList.remove('open-menu-place');
    allMenuNav.classList.remove('open-menu-all');
    iconbtn.classList.add('fa-bars');
    iconbtn.classList.remove('fa-times');
  } else {
    menu.classList.add('open-menu-place');
    menuRight.classList.add('open-menu-place');
    allMenuNav.classList.add('open-menu-all');
    iconbtn.classList.remove('fa-bars');
    iconbtn.classList.add('fa-times');
  }
}

window.goHome = function () {
  getSession().isProfessional = false;
  window.Menu.parent.menuClick({ FormId: 'Home' });
  openMenuPlace();
}

window.goDashboard = function () {
  getSession().isProfessional = false;
  console.log('Acessando dashboard');
  if (getSession().Roles.includes('1eb3cc0a-ee69-44e5-98c9-5061a929f122')) {
    window.Menu.parent.menuClick({ FormId: 'Scheduling_Professional' });
  } else {
    window.Menu.parent.menuClick({ FormId: 'Dashboard' });
  }
  openMenuPlace();
}

window.login = function () {
  localStorage.setItem('redirectAfterAuth', window.location.href);
  const hasRun = window.location.pathname.split('/').includes("run") || window.location.pathname.split('/').includes("Run");

  if (hasRun) {
    const project = window.location.href.split("/")[4];
    window.location.href = `${window.location.origin}/login/Run/${project}`;
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const phValue = urlParams.get('ph');

    if (phValue) {
      window.location.href = `${window.location.origin}/login?ph=${phValue}`;
    } else {
      window.location.href = `${window.location.origin}/login`;
    }
  }
  openMenuPlace();
}

window.logOff = function () {
  getSession().isProfessional = false;
  localStorage.removeItem("authInfo");
  const hasRun = window.location.pathname.toLowerCase().includes("run");

  if (hasRun) {
    const project = window.location.href.split("/")[4];
    window.location.href = `${window.location.origin}/Run/${project}/form/Home`;
  } else {
    window.location.href = `${window.location.origin}`;
  }
}

window.goToMyAccount = () => {
  getSession().isProfessional = false;
  window.Menu.parent.menuClick({ FormId: 'Services_order' });
}

window.cadastro = function (action) {
  getSession().isProfessional = action === 'profissional';
  window.Menu.parent.menuClick({ FormId: "Cadastro" });
  openMenuPlace();
}

window.gotoAdmin = () => {
  window.Menu.parent.menuClick({ FormId: 'Dashboard admin' });
}

function showAdminLink() {
  const adminRole = 'cfef1f19-f3f7-4c53-ae83-1dbb9e69916c';
  const profRole = '1eb3cc0a-ee69-44e5-98c9-5061a929f122';
  const adminBtn = document.getElementById('admin');
  const adminLeft = document.getElementById('adminLeft')

  if (!adminBtn) {
    console.log('Elemento admin não encontrado.');
    return;
  }

  const roles = Array.isArray(Menu.session.Roles) ? Menu.session.Roles : [];
  const userHasPermission = roles.includes(adminRole) || roles.includes(profRole);

  if (userHasPermission) {
    if (isMobile()) {
      adminLeft.classList.remove('d-none');
      adminBtn.classList.add('d-none');
    } else {
      adminLeft.classList.add('d-none');
      adminBtn.classList.remove('d-none');
    }
  } else {
    adminBtn.classList.add('d-none');
    adminLeft.classList.add('d-none');
  }
}

// Função que verifica se o usuário acabou de logar pelo botão no agendamento
function checkRedirectAfterAuth() {
  const redirectUrl = localStorage.getItem('redirectAfterAuth');
  const isUserLogged = !!getSession().UserId;

  if (redirectUrl && isUserLogged) {
    localStorage.removeItem('redirectAfterAuth');

    // Pequeno delay para garantir que tudo foi carregado antes do redirecionamento
    setTimeout(() => {
      console.log('Redirecionando para URL armazenada:', redirectUrl);
      window.location.href = redirectUrl;
    }, 500);
  }
}

function setVisible() {
  const roles = getSession().Roles;
  const hideBtns = document.querySelector('.login-register-btns');
  const logOffBtn = document.querySelector('.logoff-btn-menu');
  const hideDash = document.querySelector('.dash-only-log');
  const perfilBtn = document.querySelector('.myprofile-btn-menu');
  const myService = document.querySelector('.my_ServiceLink');

  console.log(`Roles: ${roles}`);
  if (hideBtns && logOffBtn && hideDash && perfilBtn && myService) {
    console.log('Elementos encontrados!');
    if (window.Menu && getSession().UserId) {
      hideBtns.style.display = "none";
      hideDash.style.display = "flex";
      logOffBtn.style.display = "block";
      perfilBtn.style.display = "block";
      if (!roles.includes('1eb3cc0a-ee69-44e5-98c9-5061a929f122') &&
        !roles.includes('cfef1f19-f3f7-4c53-ae83-1dbb9e69916c')) {
        myService.style.display = "block";
      } else {
        myService.style.display = "none";
      }
    } else {
      hideBtns.style.display = "flex";
      hideDash.style.display = "none";
      logOffBtn.style.display = "none";
      perfilBtn.style.display = "none";
      myService.style.display = "none";
    }
  } else {
    console.log('Elementos não encontrados!');
  }
}
