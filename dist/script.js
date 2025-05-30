"use strict";
class Contact {
    constructor(firstName, lastName, userName, phone, email = '', address = '') {
        this.id = Date.now() + Math.random();
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.createdAt = new Date();
    }
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    getInitials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
    update(data) {
        this.firstName = data.firstName || this.firstName;
        this.lastName = data.lastName || this.lastName;
        this.userName = data.userName || this.userName;
        this.phone = data.phone || this.phone;
        this.email = data.email || this.email;
        this.address = data.address || this.address;
    }
}
class ContactManager {
    constructor() {
        this.contacts = [];
        this.currentEditId = null;
        this.filteredContacts = [];
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
        else {
            this.init();
        }
    }
    init() {
        this.loadContacts();
        this.bindEvents();
        this.render();
    }
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const contactForm = document.getElementById('contactForm');
        const contactModal = document.getElementById('contactModal');
        if (!searchInput || !contactForm || !contactModal) {
            console.error('Required DOM elements not found');
            return;
        }
        searchInput.addEventListener('input', (e) => {
            const target = e.target;
            this.searchContacts(target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact();
        });
        contactModal.addEventListener('click', (e) => {
            if (e.target.id === 'contactModal') {
                this.closeModal();
            }
        });
    }
    addContact(contactData) {
        const contact = new Contact(contactData.firstName, contactData.lastName, contactData.userName, contactData.phone, contactData.email || '', contactData.address || '');
        this.contacts.push(contact);
        this.filteredContacts = [...this.contacts]; // Sync filteredContacts
        this.saveToStorage();
        this.render();
        return contact;
    }
    updateContact(id, contactData) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            contact.update(contactData);
            this.filteredContacts = [...this.contacts];
            this.saveToStorage();
            this.render();
            return contact;
        }
        return null;
    }
    deleteContact(id) {
        const index = this.contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            this.contacts.splice(index, 1);
            this.filteredContacts = [...this.contacts];
            this.saveToStorage();
            this.render();
            return true;
        }
        return false;
    }
    searchContacts(query) {
        if (!query.trim()) {
            this.filteredContacts = [...this.contacts];
        }
        else {
            const searchTerm = query.toLowerCase();
            this.filteredContacts = this.contacts.filter(contact => contact.firstName.toLowerCase().includes(searchTerm) ||
                contact.lastName.toLowerCase().includes(searchTerm) ||
                contact.userName.toLowerCase().includes(searchTerm) ||
                contact.phone.includes(searchTerm) ||
                (contact.email && contact.email.toLowerCase().includes(searchTerm)));
        }
        this.renderContacts();
    }
    saveContact() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const userName = document.getElementById('userName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const formData = {
            firstName,
            lastName,
            userName,
            phone,
            email,
            address
        };
        if (!formData.firstName || !formData.lastName || !formData.userName || !formData.phone) {
            alert('Please fill in all required fields (First Name, Last Name, User Name, Phone)');
            return;
        }
        if (this.currentEditId) {
            this.updateContact(this.currentEditId, formData);
            this.currentEditId = null;
        }
        else {
            this.addContact(formData);
        }
        this.closeModal();
        this.resetForm();
    }
    openAddModal() {
        const modalTitle = document.getElementById('modalTitle');
        const contactModal = document.getElementById('contactModal');
        modalTitle.textContent = 'Add New Contact';
        contactModal.style.display = 'flex';
        this.currentEditId = null;
        this.resetForm();
    }
    openEditModal(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact)
            return;
        const modalTitle = document.getElementById('modalTitle');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const userNameInput = document.getElementById('userName');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const addressInput = document.getElementById('address');
        const contactModal = document.getElementById('contactModal');
        modalTitle.textContent = 'Edit Contact';
        firstNameInput.value = contact.firstName;
        lastNameInput.value = contact.lastName;
        userNameInput.value = contact.userName;
        phoneInput.value = contact.phone;
        emailInput.value = contact.email;
        addressInput.value = contact.address;
        this.currentEditId = id;
        contactModal.style.display = 'flex';
    }
    closeModal() {
        const contactModal = document.getElementById('contactModal');
        contactModal.style.display = 'none';
        this.currentEditId = null;
        this.resetForm();
    }
    resetForm() {
        const contactForm = document.getElementById('contactForm');
        contactForm.reset();
    }
    confirmDelete(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact && confirm(`Are you sure you want to delete ${contact.getFullName()}?`)) {
            this.deleteContact(id);
        }
    }
    saveToStorage() {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }
    loadContacts() {
        const stored = localStorage.getItem('contacts');
        if (stored) {
            const contactsData = JSON.parse(stored);
            this.contacts = contactsData.map((data) => {
                const contact = new Contact(data.firstName, data.lastName, data.userName || '', data.phone, data.email, data.address);
                contact.id = data.id;
                contact.createdAt = new Date(data.createdAt);
                return contact;
            });
        }
        this.filteredContacts = [...this.contacts];
    }
    render() {
        this.renderContacts();
        this.updateStats();
    }
    renderContacts() {
        const container = document.getElementById('contactsContainer');
        const emptyState = document.getElementById('emptyState');
        if (!container || !emptyState) {
            console.error('Contacts container or empty state element not found');
            return;
        }
        if (this.filteredContacts.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        container.innerHTML = this.filteredContacts.map(contact => `
            <div class="contact-card">
                <div class="contact-name">${contact.getFullName()}</div>
                <div class="contact-info">
                    <span class="icon">👤</span> ${contact.userName}
                </div>
                <div class="contact-info">
                    <span class="icon">📞</span> ${contact.phone}
                </div>
                ${contact.email ? `<div class="contact-info"><span class="icon">✉️</span> ${contact.email}</div>` : ''}
                ${contact.address ? `<div class="contact-info"><span class="icon">📍</span> ${contact.address}</div>` : ''}
                <div class="contact-actions">
                    <button class="btn btn-secondary btn-small" onclick="contactManager.openEditModal(${contact.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="contactManager.confirmDelete(${contact.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    updateStats() {
        const contactCountElement = document.getElementById('contactCount');
        if (contactCountElement) {
            contactCountElement.textContent = this.contacts.length.toString();
        }
    }
}
const contactManager = new ContactManager();
function openAddModal() {
    contactManager.openAddModal();
}
function closeModal() {
    contactManager.closeModal();
}
