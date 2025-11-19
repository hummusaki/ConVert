export function triggerDownload(data, filename) {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// -- theme logic --

export function toggleContrast() {
    let isLightMode = document.documentElement.classList.contains('light-mode');
    isLightMode = !isLightMode;

    applyTheme(isLightMode);
    
    localStorage.setItem('contrastToggle', isLightMode);
    return isLightMode;
}

export function setInitialContrast() {
    const savedState = localStorage.getItem('contrastToggle');
    let isLightMode;

    if (savedState === null) {
        isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    } else {
        isLightMode = savedState === 'true';
    }

    // applyTheme handles the class toggling now
    applyTheme(isLightMode);
    return isLightMode;
}

function applyTheme(isLightMode) {
    const favicon = document.getElementById('favicon');
    const icon = document.getElementById('navbar-icon');
    const toggleBtnIcon = document.querySelector('.dark-mode-toggle i');

    if (isLightMode) {
        document.documentElement.classList.add("light-mode");
        
        if (favicon) favicon.setAttribute("href", "../assets/m2.png");
        if (icon) icon.setAttribute('src', '../assets/m.png');
        if (toggleBtnIcon) {
            toggleBtnIcon.classList.remove('fa-moon');
            toggleBtnIcon.classList.add('fa-sun');
        }
    } else {
        document.documentElement.classList.remove("light-mode");
        
        if (favicon) favicon.setAttribute("href", "../assets/m.png");
        if (icon) icon.setAttribute('src', '../assets/m2.png');
        if (toggleBtnIcon) {
            toggleBtnIcon.classList.remove('fa-sun');
            toggleBtnIcon.classList.add('fa-moon');
        }
    }
}