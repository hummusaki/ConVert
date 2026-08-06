(function(){
    try {
        var saved = localStorage.getItem('contrastToggle');
        var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        
        document.documentElement.classList.add('no-transition');

        if (saved === 'true' || (saved === null && prefersLight)) {
            document.documentElement.classList.add('light-mode');
        }

        var removeTransition = function() {
            setTimeout(function(){ 
                document.documentElement.classList.remove('no-transition'); 
            }, 50);
        };

        if (document.readyState === 'complete') {
            removeTransition();
        } else {
            window.addEventListener('load', removeTransition);
        }
    } catch(e){ /* ignore */ }
})();