import { Contact } from './contact.js';
import { StorageService } from './storage.js';

// Main application class
class ContactManagerApp {
    private storageService: StorageService;
    private contacts: Contact[] = [];
    private currentContact: Contact | null = null;
    private isEditing: boolean = false;

    // DOM Elements
    private contactListElement!: HTMLElement;
    private contactDetailsElement!: HTMLElement;
    private contactForm!: HTMLFormElement;
    private contactModal!: HTMLElement;
    private confirmModal!: HTMLElement;
    private searchInput!: HTMLInputElement;
    private addContactBtn!: HTMLButtonElement;

    constructor() {
        this.storageService = new StorageService();
        this.initializeElements();
        this.attachEventListeners();
        this.loadContacts();
        this.renderContactList();
    }

    // Initialize DOM elements
    private initializeElements(): void {
        this.contactListElement = document.getElementById('contactList') as HTMLElement;
        this.contactDetailsElement = document.getElementById('contactDetails') as HTMLElement;
        this.contactForm = document.getElementById('contactForm') as HTMLFormElement;
        this.contactModal = document.getElementById('contactModal') as HTMLElement;
        this.confirmModal = document.getElementById('confirmModal') as HTMLElement;
        this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
        this.addContactBtn = document.getElementById('addContactBtn') as HTMLButtonElement;
    }

    // Attach event listeners
    private attachEventListeners(): void {
        this.addContactBtn.addEventListener('click', () => this.openContactForm());
        this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.searchInput.addEventListener('input', () => this.handleSearch());
        document.querySelector('.close')!.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn')!.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmCancel')!.addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirmDelete')!.addEventListener('click', () => this.confirmDelete());

        window.addEventListener('click', (e) => {
            if (e.target === this.contactModal) this.closeModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });
    }

    private loadContacts(): void {
        this.contacts = this.storageService.getContacts();
    }

    private renderContactList(filteredContacts?: Contact[]): void {
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
                this.selectContact(contactId!);
            });
        });
    }

    private selectContact(contactId: string): void {
        this.contactListElement.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active'));
        const selectedItem = this.contactListElement.querySelector(`[data-contact-id="${contactId}"]`);
        if (selectedItem) selectedItem.classList.add('active');
        const foundContact = this.storageService.getContactById(contactId);
        this.currentContact = foundContact || null;
        this.renderContactDetails();
    }

    private renderContactDetails(): void {
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

        document.getElementById('editContactBtn')!.addEventListener('click', () => this.openContactForm(true));
        document.getElementById('deleteContactBtn')!.addEventListener('click', () => this.openConfirmModal());
    }

    private openContactForm(isEditing = false): void {
        this.isEditing = isEditing;
        const modalTitle = document.getElementById('modalTitle')!;
        const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
        modalTitle.textContent = isEditing ? 'Edit Contact' : 'Add New Contact';
        deleteBtn.style.display = isEditing ? 'inline-block' : 'none';
        if (isEditing && this.currentContact) this.populateForm(this.currentContact);
        else this.contactForm.reset();
        deleteBtn.onclick = () => this.openConfirmModal();
        this.contactModal.style.display = 'block';
    }

    private populateForm(c: Contact): void {
        (document.getElementById('firstName') as HTMLInputElement).value = c.firstName;
        (document.getElementById('lastName') as HTMLInputElement).value = c.lastName;
        (document.getElementById('phone') as HTMLInputElement).value = c.phone;
        (document.getElementById('email') as HTMLInputElement).value = c.email || '';
        (document.getElementById('company') as HTMLInputElement).value = c.company || '';
        (document.getElementById('notes') as HTMLTextAreaElement).value = c.notes || '';
    }

    private handleFormSubmit(e: Event): void {
        e.preventDefault();
        const formData = new FormData(this.contactForm);
        const contactData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            company: formData.get('company') as string,
            notes: formData.get('notes') as string
        };

        if (!contactData.firstName || !contactData.lastName || !contactData.phone) {
            alert('Please fill in First Name, Last Name, and Phone.');
            return;
        }

        if (this.isEditing && this.currentContact) {
            this.currentContact.update(contactData);
            this.storageService.updateContact(this.currentContact);
        } else {
            const newContact = new Contact(
                contactData.firstName,
                contactData.lastName,
                contactData.phone,
                contactData.email,
                contactData.company,
                contactData.notes
            );
            this.storageService.addContact(newContact);
            this.currentContact = newContact;
        }

        this.loadContacts();
        this.renderContactList();
        this.renderContactDetails();
        this.closeModal();
    }

    private openConfirmModal(): void { this.confirmModal.style.display = 'block'; }
    private closeConfirmModal(): void { this.confirmModal.style.display = 'none'; }
    private confirmDelete(): void {
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
    private closeModal(): void { this.contactModal.style.display = 'none'; this.contactForm.reset(); }
    private handleSearch(): void {
        const search = this.searchInput.value.trim().toLowerCase();
        if (!search) { this.renderContactList(); return; }
        const filtered = this.contacts.filter(c => c.matchesSearch(search));
        this.renderContactList(filtered);
    }
}

document.addEventListener('DOMContentLoaded', () => new ContactManagerApp());
