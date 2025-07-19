// Global UI functions for browser compatibility
(function() {
    'use strict';
    
    // A cache for DOM elements to avoid repeated lookups
    var dom = {};

    /**
     * Gets the Arabic day name for a given date
     * @param {Date} date - The date object
     * @returns {string} The Arabic day name
     */
    function getArabicDayName(date) {
        var dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return dayNames[date.getDay()];
    }

    /**
     * Queries and caches essential DOM elements from the main page.
     * @returns {object} An object containing the DOM elements.
     */
    function getDOMElements() {
        if (Object.keys(dom).length === 0) {
            dom.loadingOverlay = document.getElementById('loading-overlay');
            dom.formSection = document.getElementById('form-section');
            dom.playlistForm = document.getElementById('playlist-form');
            dom.playlistSection = document.getElementById('playlist-section');
            dom.showFormBtn = document.getElementById('show-form-btn');
            dom.cancelBtn = document.getElementById('cancel-btn');
            dom.songsContainer = document.getElementById('songs-container');
            dom.addSongBtn = document.getElementById('add-song-btn');
            dom.formTitle = document.getElementById('form-title');
            dom.saveBtn = document.getElementById('save-btn');
            dom.dayNameDisplay = document.getElementById('dayName');
            dom.dateAvailabilityMessage = document.getElementById('date-availability-message');
            // Form inputs
            dom.playlistIdInput = document.getElementById('playlistId');
            dom.eventDateInput = document.getElementById('eventDate');
            dom.eventLocationInput = document.getElementById('eventLocation');
            dom.phoneNumberInput = document.getElementById('phoneNumber');
            dom.brideZaffaInput = document.getElementById('brideZaffa');
            dom.groomZaffaInput = document.getElementById('groomZaffa');
        }
        return dom;
    }

    /**
     * Shows or hides the loading overlay.
     * @param {boolean} show - `true` to show, `false` to hide.
     */
    function showLoading(show) {
        var loadingOverlay = getDOMElements().loadingOverlay;
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    // Make functions globally accessible
    window.getDOMElements = getDOMElements;
    window.showLoading = showLoading;
    window.getArabicDayName = getArabicDayName;
    
    /* @tweakable The confirmation message shown when deleting a song. */
    const songDeleteConfirmationMessage = 'هل أنت متأكد من حذف هذه الأغنية؟';
    // Make the variable globally accessible for form.js
    window.songDeleteConfirmationMessage = songDeleteConfirmationMessage;
})();