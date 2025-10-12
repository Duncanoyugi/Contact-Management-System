import { Contact } from './contact.js';
import { StorageService } from './storage.js';
// Main application class
class ContactManagerApp {
    constructor() {
        this.contacts = [];
        this.currentContact = null;
        this.isEditing = false;
        this.storageService = new StorageService();
        this.initializeElements();
        this.attachEventListeners();
        this.loadContacts();
        this.renderContactList();
    }
    // Initialize DOM elements
    initializeElements() {
        this.contactListElement = document.getElementById('contactList');
        this.contactDetailsElement = document.getElementById('contactDetails');
        this.contactForm = document.getElementById('contactForm');
        this.contactModal = document.getElementById('contactModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.searchInput = document.getElementById('searchInput');
        this.addContactBtn = document.getElementById('addContactBtn');
    }
    // Attach event listeners
    attachEventListeners() {
        this.addContactBtn.addEventListener('click', () => this.openContactForm());
        this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.searchInput.addEventListener('input', () => this.handleSearch());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('confirmCancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
        window.addEventListener('click', (e) => {
            if (e.target === this.contactModal)
                this.closeModal();
            if (e.target === this.confirmModal)
                this.closeConfirmModal();
        });
    }
    loadContacts() {
        this.contacts = this.storageService.getContacts();
    }
    renderContactList(filteredContacts) {
        const contactsToRender = filteredContacts || this.contacts;
        if (contactsToRender.length === 0) {
            this.contactListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No contacts found</p>
                </div>`;
            return;
        }
        this.contactListElement.innerHTML = contactsToRender.map(contact => `
            <div class="contact-item" data-contact-id="${contact.id}">
                <div class="contact-avatar">${contact.initials}</div>
                <div class="contact-info">
                    <h4>${contact.fullName}</h4>
                    <p>${contact.phone}</p>
                </div>
            </div>`).join('');
        this.contactListElement.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.getAttribute('data-contact-id');
                this.selectContact(contactId);
            });
        });
    }
    selectContact(contactId) {
        this.contactListElement.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active'));
        const selectedItem = this.contactListElement.querySelector(`[data-contact-id="${contactId}"]`);
        if (selectedItem)
            selectedItem.classList.add('active');
        const foundContact = this.storageService.getContactById(contactId);
        this.currentContact = foundContact || null;
        this.renderContactDetails();
    }
    renderContactDetails() {
        if (!this.currentContact) {
            this.contactDetailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <h3>No Contact Selected</h3>
                    <p>Select a contact or add a new one</p>
                </div>`;
            return;
        }
        const c = this.currentContact;
        this.contactDetailsElement.innerHTML = `
            <div class="contact-header">
                <div class="contact-avatar-large">${c.initials}</div>
                <div class="contact-name">
                    <h2>${c.fullName}</h2><p>${c.phone}</p>
                </div>
                <div class="contact-actions">
                    <button class="btn btn-primary" id="editContactBtn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger" id="deleteContactBtn"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>`;
        document.getElementById('editContactBtn').addEventListener('click', () => this.openContactForm(true));
        document.getElementById('deleteContactBtn').addEventListener('click', () => this.openConfirmModal());
    }
    openContactForm(isEditing = false) {
        this.isEditing = isEditing;
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteBtn');
        modalTitle.textContent = isEditing ? 'Edit Contact' : 'Add New Contact';
        deleteBtn.style.display = isEditing ? 'inline-block' : 'none';
        if (isEditing && this.currentContact)
            this.populateForm(this.currentContact);
        else
            this.contactForm.reset();
        deleteBtn.onclick = () => this.openConfirmModal();
        this.contactModal.style.display = 'block';
    }
    populateForm(c) {
        document.getElementById('firstName').value = c.firstName;
        document.getElementById('lastName').value = c.lastName;
        document.getElementById('phone').value = c.phone;
        document.getElementById('email').value = c.email || '';
        document.getElementById('company').value = c.company || '';
        document.getElementById('notes').value = c.notes || '';
    }
    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.contactForm);
        const contactData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            company: formData.get('company'),
            notes: formData.get('notes')
        };
        if (!contactData.firstName || !contactData.lastName || !contactData.phone) {
            alert('Please fill in First Name, Last Name, and Phone.');
            return;
        }
        if (this.isEditing && this.currentContact) {
            this.currentContact.update(contactData);
            this.storageService.updateContact(this.currentContact);
        }
        else {
            const newContact = new Contact(contactData.firstName, contactData.lastName, contactData.phone, contactData.email, contactData.company, contactData.notes);
            this.storageService.addContact(newContact);
            this.currentContact = newContact;
        }
        this.loadContacts();
        this.renderContactList();
        this.renderContactDetails();
        this.closeModal();
    }
    openConfirmModal() { this.confirmModal.style.display = 'block'; }
    closeConfirmModal() { this.confirmModal.style.display = 'none'; }
    confirmDelete() {
        if (this.currentContact) {
            this.storageService.deleteContact(this.currentContact.id);
            this.loadContacts();
            this.renderContactList();
            this.currentContact = null;
            this.renderContactDetails();
            this.closeModal();
            this.closeConfirmModal();
        }
    }
    closeModal() { this.contactModal.style.display = 'none'; this.contactForm.reset(); }
    handleSearch() {
        const search = this.searchInput.value.trim().toLowerCase();
        if (!search) {
            this.renderContactList();
            return;
        }
        const filtered = this.contacts.filter(c => c.matchesSearch(search));
        this.renderContactList(filtered);
    }
}
document.addEventListener('DOMContentLoaded', () => new ContactManagerApp());
//# sourceMappingURL=app.js.map