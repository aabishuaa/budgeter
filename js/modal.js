/**
 * Modal Component Module
 * Replaces native alert/confirm/prompt with beautiful custom modals
 */

/**
 * Create and show a modal
 */
function createModal(title, content, buttons = []) {
    // Remove any existing modals
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Modal header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeModal()">
            <i data-lucide="x"></i>
        </button>
    `;

    // Modal body
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }

    // Modal footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    // Add buttons
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.className || 'btn-secondary'}`;
        button.textContent = btn.text;
        button.onclick = () => {
            if (btn.onClick) btn.onClick();
            closeModal();
        };
        footer.appendChild(button);
    });

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(body);
    if (buttons.length > 0) {
        modal.appendChild(footer);
    }
    overlay.appendChild(modal);

    // Add to document
    document.body.appendChild(overlay);

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Show modal with animation
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    return overlay;
}

/**
 * Close the modal
 */
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 250);
    }
}

/**
 * Show alert modal (replaces window.alert)
 */
function showAlert(message, title = 'Notice') {
    createModal(title, `<p style="margin: 0; font-size: 1rem;">${message}</p>`, [
        {
            text: 'OK',
            className: 'btn-primary',
            onClick: () => {}
        }
    ]);
}

/**
 * Show confirm modal (replaces window.confirm)
 */
function showConfirm(message, title = 'Confirm', onConfirm, onCancel) {
    createModal(title, `<p style="margin: 0; font-size: 1rem;">${message}</p>`, [
        {
            text: 'Cancel',
            className: 'btn-secondary',
            onClick: onCancel || (() => {})
        },
        {
            text: 'Confirm',
            className: 'btn-primary',
            onClick: onConfirm
        }
    ]);
}

/**
 * Show prompt modal (replaces window.prompt)
 */
function showPrompt(message, title = 'Input', defaultValue = '', onConfirm, inputType = 'text') {
    const content = document.createElement('div');
    content.innerHTML = `
        <label class="form-label" style="margin-bottom: var(--spacing-sm);">${message}</label>
        <input
            type="${inputType}"
            id="modal-input"
            class="form-input"
            value="${defaultValue}"
            ${inputType === 'number' ? 'step="0.01" min="0"' : ''}
            style="width: 100%;"
        >
    `;

    createModal(title, content, [
        {
            text: 'Cancel',
            className: 'btn-secondary',
            onClick: () => {}
        },
        {
            text: 'OK',
            className: 'btn-success',
            onClick: () => {
                const input = document.getElementById('modal-input');
                if (input && onConfirm) {
                    onConfirm(input.value);
                }
            }
        }
    ]);

    // Focus input after modal appears
    setTimeout(() => {
        const input = document.getElementById('modal-input');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);

    // Submit on Enter
    setTimeout(() => {
        const input = document.getElementById('modal-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (onConfirm) {
                        onConfirm(input.value);
                    }
                    closeModal();
                }
            });
        }
    }, 100);
}
