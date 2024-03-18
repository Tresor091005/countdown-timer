class CountdownTracker {
    /**
    * Constructeur de la classe CountdownTracker.
    * @param {string} label - Libellé de l'élément de compte à rebours (ex: "Hours", "Minutes", "Seconds").
    * @param {number} value - Valeur initiale de l'élément de compte à rebours.
    */
    constructor(label, value) {
        this.el = document.createElement('span');
        this.el.className = 'flip-clock__piece';
        this.el.innerHTML = `<b class="flip-clock__card card">
            <b class="card__top"></b>
            <b class="card__bottom"></b>
            <b class="card__back"><b class="card__bottom"></b></b>
            </b>
            <span class="flip-clock__slot">${label}</span>`;
    
        this.top = this.el.querySelector('.card__top');
        this.bottom = this.el.querySelector('.card__bottom');
        this.back = this.el.querySelector('.card__back');
        this.backBottom = this.el.querySelector('.card__back .card__bottom');
    
        this.currentValue = null;
        this.update(value);
    }
  
    /**
    * Met à jour la valeur affichée de l'élément de compte à rebours.
    * @param {number} val - Nouvelle valeur de l'élément de compte à rebours.
    */
    update(val) {
        val = ('0' + val).slice(-2); 
        if (val != this.currentValue) {
            if (this.currentValue !== null) {
                this.bottom.setAttribute('data-value', this.currentValue);
                this.back.setAttribute('data-value', this.currentValue);
            }

            this.currentValue = val;
            this.top.innerText = this.currentValue;
            this.backBottom.setAttribute('data-value', this.currentValue);
    
            // Effectue une animation de retournement pour afficher la nouvelle valeur.
            this.el.classList.remove('flip');
            void this.el.offsetWidth;
            this.el.classList.add('flip');
        }
    }
  
    /**
    * Vérifie si l'élément de compte à rebours a une valeur définie.
    * @returns {boolean} - true si la valeur est définie, sinon false.
    */
    hasValue() {
        return this.currentValue !== null;
    }
}
  
/**
* Calcule le temps restant jusqu'à une date de fin donnée.
* @param {Date} endtime - Date de fin du compte à rebours.
* @returns {Object} - Objet contenant le temps restant en jours, heures, minutes et secondes.
*/
function getTimeRemaining(endtime) {
    const t = Date.parse(endtime) - Date.parse(new Date());
    return {
        'Total': t,
        'Days': Math.floor(t / (1000 * 60 * 60 * 24)),
        'Hours': Math.floor((t / (1000 * 60 * 60)) % 24),
        'Minutes': Math.floor((t / 1000 / 60) % 60),
        'Seconds': Math.floor((t / 1000) % 60)
    };
}
  
/**
* Obtient l'heure actuelle.
* @returns {Object} - Objet contenant l'heure actuelle, les minutes et les secondes.
*/
function getTime() {
    const t = new Date();
    return {
        'Total': t,
        'Hours': t.getHours() % 12,
        'Minutes': t.getMinutes(),
        'Seconds': t.getSeconds()
    };
}
  
class Clock {
    /**
    * Constructeur de la classe Clock.
    * @param {Date} countdown - Date de fin du compte à rebours
    * @param {Function} callback - Fonction de rappel à appeler lorsque le compte à rebours est terminé.
    */
    constructor(countdown, callback) {
        this.el = document.createElement('div');
        this.el.className = 'flip-clock';

        this.countdown = countdown ? new Date(Date.parse(countdown)) : false;
        this.callback = callback || function(){};
    }
  
    /**
    * Initialise l'horloge et démarre le compte à rebours.
    */
    async initialize() {
        const updateFn = this.countdown ? getTimeRemaining : getTime;
        const t = updateFn(this.countdown);
        const trackers = {};
        for (const key in t) {
            if (key === 'Total') { continue; }
            trackers[key] = new CountdownTracker(key, t[key]);
            this.el.appendChild(trackers[key].el);
        }
        // Cache l'horloge si au moins un tracker n'a pas de valeur définie.
        if (!Object.values(trackers).every(tracker => tracker.hasValue())) {
            this.el.style.display = 'none';
            return;
        }
        const updateClock = async () => {
            // Obtient le "temps" actuel.
            const t = updateFn(this.countdown);
            // Si le temps restant est négatif, le compte à rebours est terminé.
            if (t.Total < 0) {
                clearInterval(timeinterval);
                for (const key in trackers) {
                    trackers[key].update(0);
                }
                this.callback();
                return;
            }
        
            for (const key in trackers) {
                trackers[key].update(t[key]);
            }
        };
        // Met à jour l'horloge une première fois puis démarre un intervalle pour la mise à jour continue.
        updateClock();
        const timeinterval = setInterval(updateClock, 1000);
    }
}
  
/**
* Initialise une horloge ou un compte à rebours.
* @param {HTMLElement} parent - L'élément HTML auquel l'horloge sera attachée.
* @param {Date} countdown - Date de fin du compte à rebours (optionnel).
* @param {Function} callback - Fonction de rappel à exécuter lorsque le compte à rebours se termine (optionnel).
*/
export async function runClock(parent, deadline, callback) {
    if (deadline && callback) {
        const c = new Clock(deadline, callback);
        parent.appendChild(c.el);
        await c.initialize()
    } else {
        const clock = new Clock();
        parent.appendChild(clock.el);
        await clock.initialize();
    }
}