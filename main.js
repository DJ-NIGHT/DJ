// Main application logic
(function() {
    'use strict';
    
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed');
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        /* @tweakable The maximum year allowed for the event date. */
        const maxEventYear = 9999;
        
        /* @tweakable The required number of digits for the phone number. */
        const phoneNumberLength = 8;
        
        /* @tweakable The maximum width of the new/edit form. */
        const formMaxWidth = '500px';
        document.documentElement.style.setProperty('--form-max-width', formMaxWidth);

        /* @tweakable The maximum width of the alert/confirmation modal window. */
        const modalMaxWidth = "320px";
        /* @tweakable The font size for the alert/confirmation modal title. */
        const modalTitleFontSize = "1.4rem";
        /* @tweakable The font size for the alert/confirmation modal message text. */
        const modalMessageFontSize = "1.1rem";
        /* @tweakable The font weight for the alert/confirmation modal message text. */
        const modalMessageFontWeight = "bold";

        document.documentElement.style.setProperty('--modal-max-width', modalMaxWidth);
        document.documentElement.style.setProperty('--modal-title-font-size', modalTitleFontSize);
        document.documentElement.style.setProperty('--modal-message-font-size', modalMessageFontSize);
        document.documentElement.style.setProperty('--modal-message-font-weight', modalMessageFontWeight);

        /* @tweakable The gap between the location and date in the card header. */
        const cardHeaderGap = '1.5rem';
        document.documentElement.style.setProperty('--card-header-gap', cardHeaderGap);

        // Check if user is logged in
        var currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Display current user
        var userDisplay = document.getElementById('current-user-display');
        if (userDisplay) {
            userDisplay.textContent = 'مرحباً، ' + currentUser;
        }

        // Logout functionality
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            /* @tweakable Font size for the logout button text */
            const logoutFontSize = '1.1rem';
            /* @tweakable Font weight for the logout button text */
            const logoutFontWeight = 'bold';

            logoutBtn.style.fontSize = logoutFontSize;
            logoutBtn.style.fontWeight = logoutFontWeight;
            
            logoutBtn.addEventListener('click', function() {
                window.showConfirm('هل أنت متأكد من تسجيل الخروج؟')
                    .then(function(confirmed) {
                        if (confirmed) {
                            localStorage.removeItem('currentUser');
                            localStorage.removeItem('currentUserPassword');
                            localStorage.removeItem('archivedPlaylists');
                            window.location.href = 'login.html';
                        }
                    });
            });
        }

        // Check if the GAS_URL_ENDPOINT is configured
        if (!window.GAS_URL_ENDPOINT || window.GAS_URL_ENDPOINT === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' || window.GAS_URL_ENDPOINT.indexOf('https://script.google.com') !== 0) {
            window.showAlert('الرجاء اتباع التعليمات في ملف config.js وإضافة رابط Google Apps Script الصحيح.');
            window.showLoading(false);
            return;
        }

        var dom = window.getDOMElements();

        /**
         * Checks if the selected date is already booked.
         */
        function checkDateAvailability() {
            var selectedDateValue = dom.eventDateInput.value;
            if (!selectedDateValue) {
                window.updateDateAvailabilityMessage(null);
                return;
            }

            var allSheetData = window.getAllSheetData() || [];
            var editingId = dom.playlistIdInput.value;
            var isBooked = false;
            
            var selectedDate = new Date(selectedDateValue);
            // Adjust for timezone to compare dates correctly
            selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
            var selectedDateString = selectedDate.toISOString().split('T')[0];

            for (var i = 0; i < allSheetData.length; i++) {
                var playlist = allSheetData[i];
                if (!playlist.date) continue;
                
                // Don't compare against itself when editing
                if (editingId && playlist.id.toString() === editingId.toString()) {
                    continue;
                }
                
                var playlistDate = new Date(playlist.date);
                playlistDate.setMinutes(playlistDate.getMinutes() + playlistDate.getTimezoneOffset());
                var playlistDateString = playlistDate.toISOString().split('T')[0];
                
                if (playlistDateString === selectedDateString) {
                    isBooked = true;
                    break;
                }
            }
            
            window.updateDateAvailabilityMessage(!isBooked);
        }

        if (dom.phoneNumberInput) {
            dom.phoneNumberInput.maxLength = phoneNumberLength;
            dom.phoneNumberInput.pattern = `[0-9]{${phoneNumberLength}}`;
            dom.phoneNumberInput.title = `الرجاء إدخال ${phoneNumberLength} أرقام فقط`;
            dom.phoneNumberInput.addEventListener('input', function(e) {
                // Remove any non-digit characters
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        if (dom.eventDateInput) {
            dom.eventDateInput.max = `${maxEventYear}-12-31`;
            dom.eventDateInput.addEventListener('change', checkDateAvailability);
            dom.eventDateInput.addEventListener('change', function() {
                window.updateDayNameDisplay(window.getDOMElements().eventDateInput, window.getDOMElements().dayNameDisplay);
            });
        }

        // --- Event Listeners ---
        if (dom.showFormBtn) {
            dom.showFormBtn.addEventListener('click', function() {
                window.showForm(true);
            });
        }
        if (dom.cancelBtn) {
            dom.cancelBtn.addEventListener('click', window.resetForm);
        }
        if (dom.addSongBtn) {
            dom.addSongBtn.addEventListener('click', function() {
                window.requestAddSongField();
            });
        }
        if (dom.playlistForm) {
            dom.playlistForm.addEventListener('submit', window.handleFormSubmit);
        }
        if (dom.playlistSection) {
            dom.playlistSection.addEventListener('click', window.handlePlaylistAction);
        }

        // --- Initial Load ---
        window.initializePage();
        window.resetForm(); // Reset form initially to set it up correctly (e.g., add first song field)
        window.showForm(false); // Then hide it
        
        // Start real-time synchronization
        window.startRealTimeSync();
        
        // Enhanced visibility change handling
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                window.stopRealTimeSync();
            } else {
                // Force sync when page becomes visible again
                window.startRealTimeSync();
            }
        });
        
        // Enhanced beforeunload handling
        window.addEventListener('beforeunload', function() {
            window.stopRealTimeSync();
        });
        
        // Force sync on window focus
        window.addEventListener('focus', function() {
            window.syncDataFromSheet();
        });
    });
})();