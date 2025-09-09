// DOM Elements
const urlForm = document.getElementById('urls-form');
const urlFormContainer = document.getElementById('url-form');
const iframeContainer = document.getElementById('iframe-container');
const mirrorIframe = document.getElementById('mirror-iframe');
const roleplayIframe = document.getElementById('roleplay-iframe');
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const closeSettings = document.getElementById('close-settings');
const settingsForm = document.getElementById('settings-form');
const resetBtn = document.getElementById('reset-btn');

// Settings form inputs
const settingsMirrorInput = document.getElementById('settings-mirror-url');
const settingsRoleplayInput = document.getElementById('settings-roleplay-url');
const roleplayModeSelect = document.getElementById('roleplay-mode');

// Main form inputs
const mirrorInput = document.getElementById('mirror-url');
const roleplayInput = document.getElementById('roleplay-url');

// State management
let currentUrls = {
    mirror: '',
    roleplay: ''
};

// Utility Functions
function addMirrorScormParam(url) {
    if (!url) return url;
    
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('mirrorScorm', 'true');
        return urlObj.toString();
    } catch (error) {
        console.error('Invalid URL:', error);
        return url;
    }
}

function handleCSPError(iframe, fallbackUrl) {
    iframe.onerror = function() {
        console.warn('CSP blocked iframe, using fallback');
        iframe.src = fallbackUrl || 'about:blank';
    };
}

function updateIframes(mirrorUrl, roleplayUrl) {
    const processedMirrorUrl = addMirrorScormParam(mirrorUrl);
    
    mirrorIframe.src = processedMirrorUrl;
    
    // Get roleplay mode setting
    const roleplayMode = roleplayModeSelect.value;
    
    if (roleplayMode === 'fallback') {
        // Show fallback content immediately to avoid CSP error
        const fallbackContent = createFallbackContent(roleplayUrl);
        roleplayIframe.src = `data:text/html,${encodeURIComponent(fallbackContent)}`;
    } else if (roleplayMode === 'popup') {
        // Show popup launcher
        const popupContent = createPopupContent(roleplayUrl);
        roleplayIframe.src = `data:text/html,${encodeURIComponent(popupContent)}`;
    } else {
        // Try to load iframe directly (will likely be blocked by CSP)
        roleplayIframe.src = roleplayUrl;
        
        // Set up error handling for CSP
        roleplayIframe.onerror = function() {
            const fallbackContent = createFallbackContent(roleplayUrl);
            roleplayIframe.src = `data:text/html,${encodeURIComponent(fallbackContent)}`;
        };
        
        // Also handle CSP errors that don't trigger onerror
        setTimeout(() => {
            try {
                // Try to access iframe content to detect CSP blocking
                if (roleplayIframe.contentWindow === null) {
                    const fallbackContent = createFallbackContent(roleplayUrl);
                    roleplayIframe.src = `data:text/html,${encodeURIComponent(fallbackContent)}`;
                }
            } catch (e) {
                // CSP blocked, show fallback
                const fallbackContent = createFallbackContent(roleplayUrl);
                roleplayIframe.src = `data:text/html,${encodeURIComponent(fallbackContent)}`;
            }
        }, 1000);
    }
    
    // Store current URLs
    currentUrls.mirror = mirrorUrl;
    currentUrls.roleplay = roleplayUrl;
}

function createFallbackContent(roleplayUrl) {
    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #1a1a1a;
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        ">
            <div style="max-width: 300px;">
                <h3 style="margin: 0 0 12px 0; font-size: 1.2rem; font-weight: 600; color: #ffffff;">Roleplay Panel</h3>
                <p style="margin: 0 0 16px 0; font-size: 0.9rem; color: #888; line-height: 1.4;">
                    Click to open roleplay in a new window
                </p>
                <button onclick="openRoleplayWindow('${roleplayUrl}')" style="
                    background: #333;
                    border: 1px solid #555;
                    border-radius: 6px;
                    color: #e5e5e5;
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    margin-bottom: 8px;
                " onmouseover="this.style.background='#444'; this.style.borderColor='#666';" onmouseout="this.style.background='#333'; this.style.borderColor='#555';">
                    Open Roleplay
                </button>
                <div style="font-size: 0.75rem; color: #666; margin-top: 8px;">
                    <p style="margin: 0;">Tip: Use Alt+Tab to switch between windows</p>
                </div>
            </div>
        </div>
    `;
}

// Global function to open roleplay window
window.openRoleplayWindow = function(url) {
    const roleplayWindow = window.open(
        url, 
        'roleplay', 
        'width=800,height=600,resizable=yes,scrollbars=yes,status=yes,location=yes,toolbar=yes,menubar=yes'
    );
    
    if (roleplayWindow) {
        roleplayWindow.focus();
        // Show notification
        showSuccessMessage('Roleplay opened in new window');
    } else {
        showSuccessMessage('Please allow popups for this site');
    }
};

// Global function to open roleplay popup
window.openRoleplayPopup = function(url) {
    const popup = window.open(
        url,
        'roleplayPopup',
        'width=400,height=300,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no'
    );
    
    if (popup) {
        popup.focus();
        showSuccessMessage('Roleplay opened in popup');
    } else {
        showSuccessMessage('Please allow popups for this site');
    }
};

function createPopupContent(roleplayUrl) {
    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #1a1a1a;
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        ">
            <div style="max-width: 300px;">
                <h3 style="margin: 0 0 12px 0; font-size: 1.2rem; font-weight: 600; color: #ffffff;">Roleplay Launcher</h3>
                <p style="margin: 0 0 16px 0; font-size: 0.9rem; color: #888; line-height: 1.4;">
                    Choose how to open roleplay
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="openRoleplayWindow('${roleplayUrl}')" style="
                        background: #333;
                        border: 1px solid #555;
                        border-radius: 6px;
                        color: #e5e5e5;
                        padding: 8px 16px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-family: inherit;
                    " onmouseover="this.style.background='#444'; this.style.borderColor='#666';" onmouseout="this.style.background='#333'; this.style.borderColor='#555';">
                        New Window
                    </button>
                    <button onclick="openRoleplayPopup('${roleplayUrl}')" style="
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 6px;
                        color: #e5e5e5;
                        padding: 8px 16px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-family: inherit;
                    " onmouseover="this.style.background='#333'; this.style.borderColor='#555';" onmouseout="this.style.background='#2a2a2a'; this.style.borderColor='#444';">
                        Popup Window
                    </button>
                </div>
                <div style="font-size: 0.75rem; color: #666; margin-top: 12px;">
                    <p style="margin: 0;">Ctrl+R: Quick open | Alt+Tab: Switch windows</p>
                </div>
            </div>
        </div>
    `;
}

function showInterface() {
    urlFormContainer.classList.add('hidden');
    iframeContainer.classList.remove('hidden');
    settingsToggle.classList.remove('hidden');
}

function showForm() {
    urlFormContainer.classList.remove('hidden');
    iframeContainer.classList.add('hidden');
    settingsToggle.classList.add('hidden');
    settingsPanel.classList.add('hidden');
}

function toggleSettings() {
    settingsPanel.classList.toggle('show');
}

// Event Listeners
urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mirrorUrl = mirrorInput.value.trim();
    const roleplayUrl = roleplayInput.value.trim();
    
    // Use native HTML5 validation
    if (!urlForm.checkValidity()) {
        urlForm.reportValidity();
        return;
    }
    
    // Update iframes and show interface
    updateIframes(mirrorUrl, roleplayUrl);
    showInterface();
    
    // Store URLs in settings form
    settingsMirrorInput.value = mirrorUrl;
    settingsRoleplayInput.value = roleplayUrl;
});

settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mirrorUrl = settingsMirrorInput.value.trim();
    const roleplayUrl = settingsRoleplayInput.value.trim();
    
    // Use native HTML5 validation
    if (!settingsForm.checkValidity()) {
        settingsForm.reportValidity();
        return;
    }
    
    // Update iframes
    updateIframes(mirrorUrl, roleplayUrl);
    
    // Close settings panel
    settingsPanel.classList.remove('show');
    
    // Show success message
    showSuccessMessage('URLs updated successfully!');
});

resetBtn.addEventListener('click', () => {
    // Clear form inputs
    settingsMirrorInput.value = '';
    settingsRoleplayInput.value = '';
    
    // Show main form
    showForm();
    
    // Clear iframes
    mirrorIframe.src = '';
    roleplayIframe.src = '';
    
    // Reset state
    currentUrls = { mirror: '', roleplay: '' };
});

settingsToggle.addEventListener('click', toggleSettings);
closeSettings.addEventListener('click', toggleSettings);

// Close settings panel when clicking outside
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        toggleSettings();
    }
});

// Native validation styling
[mirrorInput, roleplayInput, settingsMirrorInput, settingsRoleplayInput].forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.target.style.borderColor = '#ff6b6b';
    });
    
    input.addEventListener('input', (e) => {
        e.target.style.borderColor = '#444';
    });
});

// Success message function
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2a2a2a;
        border: 1px solid #444;
        color: #e5e5e5;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
        font-family: inherit;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Add CSS animations for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close settings
    if (e.key === 'Escape' && settingsPanel.classList.contains('show')) {
        toggleSettings();
    }
    
    // Ctrl/Cmd + , to open settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        if (!settingsPanel.classList.contains('show')) {
            toggleSettings();
        }
    }
    
    // Ctrl/Cmd + R to open roleplay window
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && currentUrls.roleplay) {
        e.preventDefault();
        window.openRoleplayWindow(currentUrls.roleplay);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if URLs are stored in localStorage
    const storedUrls = localStorage.getItem('mirrorContainerUrls');
    if (storedUrls) {
        try {
            const urls = JSON.parse(storedUrls);
            if (urls.mirror && urls.roleplay) {
                mirrorInput.value = urls.mirror;
                roleplayInput.value = urls.roleplay;
                settingsMirrorInput.value = urls.mirror;
                settingsRoleplayInput.value = urls.roleplay;
            }
        } catch (error) {
            console.error('Error loading stored URLs:', error);
        }
    }
});

// Save URLs to localStorage when updated
function saveUrlsToStorage() {
    localStorage.setItem('mirrorContainerUrls', JSON.stringify(currentUrls));
}

// Update the updateIframes function to save to localStorage
const originalUpdateIframes = updateIframes;
updateIframes = function(mirrorUrl, roleplayUrl) {
    originalUpdateIframes(mirrorUrl, roleplayUrl);
    saveUrlsToStorage();
};
