interface IContact {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    phone: string;
    email?: string;
    address?: string;
    createdAt: Date;
}

interface ContactFormData {
    firstName: string;
    lastName: string;
    userName: string;
    phone: string;
    email?: string;
    address?: string;
}

class Contact implements IContact {
    public id: number;
    public firstName: string;
    public lastName: string;
    public userName: string;
    public phone: string;
    public email: string;
    public address: string;
    public createdAt: Date;

    constructor(firstName: string, lastName: string, userName: string, phone: string, email: string = '', address: string = '') {
        this.id = Date.now() + Math.random(); 
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.createdAt = new Date();
    }

    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public getInitials(): string {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }

    public update(data: Partial<ContactFormData>): void {
        this.firstName = data.firstName || this.firstName;
        this.lastName = data.lastName || this.lastName;
        this.userName = data.userName || this.userName;
        this.phone = data.phone || this.phone;
        this.email = data.email || this.email;
        this.address = data.address || this.address;
    }
}

class ContactManager {
    private contacts: Contact[] = [];
    private currentEditId: number | null = null;
    private filteredContacts: Contact[] = [];

    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    private init(): void {
        this.loadContacts();
        this.bindEvents();
        this.render();
    }

    private bindEvents(): void {
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        const contactForm = document.getElementById('contactForm') as HTMLFormElement;
        const contactModal = document.getElementById('contactModal') as HTMLElement;

        if (!searchInput || !contactForm || !contactModal) {
            console.error('Required DOM elements not found');
            return;
        }

        searchInput.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.searchContacts(target.value);
        });
        searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
            }
        });
        contactForm.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.saveContact();
        });

        contactModal.addEventListener('click', (e: Event) => {
            if ((e.target as HTMLElement).id === 'contactModal') {
                this.closeModal();
            }
        });
    }

    public addContact(contactData: ContactFormData): Contact {
        const contact = new Contact(
            contactData.firstName,
            contactData.lastName,
            contactData.userName,
            contactData.phone,
            contactData.email || '',
            contactData.address || ''
        );
        this.contacts.push(contact);
        this.filteredContacts = [...this.contacts]; // Sync filteredContacts
        this.saveToStorage();
        this.render();
        return contact;
    }

    public updateContact(id: number, contactData: ContactFormData): Contact | null {
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

    public deleteContact(id: number): boolean {
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

    private searchContacts(query: string): void {
        if (!query.trim()) {
            this.filteredContacts = [...this.contacts];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredContacts = this.contacts.filter(contact =>
                contact.firstName.toLowerCase().includes(searchTerm) ||
                contact.lastName.toLowerCase().includes(searchTerm) ||
                contact.userName.toLowerCase().includes(searchTerm) ||
                contact.phone.includes(searchTerm) ||
                (contact.email && contact.email.toLowerCase().includes(searchTerm))
            );
        }
        this.renderContacts();
    }

    private saveContact(): void {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value.trim();
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value.trim();
        const userName = (document.getElementById('userName') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('phone') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        const address = (document.getElementById('address') as HTMLInputElement).value.trim();

        const formData: ContactFormData = {
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
        } else {
            this.addContact(formData);
        }

        this.closeModal();
        this.resetForm();
    }

    public openAddModal(): void {
        const modalTitle = document.getElementById('modalTitle') as HTMLElement;
        const contactModal = document.getElementById('contactModal') as HTMLElement;

        modalTitle.textContent = 'Add New Contact';
        contactModal.style.display = 'flex'; 
        this.currentEditId = null;
        this.resetForm();
    }

    public openEditModal(id: number): void {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        const modalTitle = document.getElementById('modalTitle') as HTMLElement;
        const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
        const lastNameInput = document.getElementById('lastName') as HTMLInputElement;
        const userNameInput = document.getElementById('userName') as HTMLInputElement;
        const phoneInput = document.getElementById('phone') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const addressInput = document.getElementById('address') as HTMLInputElement;
        const contactModal = document.getElementById('contactModal') as HTMLElement;

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

    public closeModal(): void {
        const contactModal = document.getElementById('contactModal') as HTMLElement;
        contactModal.style.display = 'none';
        this.currentEditId = null;
        this.resetForm();
    }

    private resetForm(): void {
        const contactForm = document.getElementById('contactForm') as HTMLFormElement;
        contactForm.reset();
    }

    public confirmDelete(id: number): void {
        const contact = this.contacts.find(c => c.id === id);
        if (contact && confirm(`Are you sure you want to delete ${contact.getFullName()}?`)) {
            this.deleteContact(id);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    private loadContacts(): void {
        const stored = localStorage.getItem('contacts');
        if (stored) {
            const contactsData = JSON.parse(stored);
            this.contacts = contactsData.map((data: any) => {
                const contact = new Contact(
                    data.firstName,
                    data.lastName,
                    data.userName || '', 
                    data.phone,
                    data.email,
                    data.address
                );
                contact.id = data.id;
                contact.createdAt = new Date(data.createdAt);
                return contact;
            });
        }
        this.filteredContacts = [...this.contacts];
    }

    private render(): void {
        this.renderContacts();
        this.updateStats();
    }

    private renderContacts(): void {
        const container = document.getElementById('contactsContainer') as HTMLElement;
        const emptyState = document.getElementById('emptyState') as HTMLElement;

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

    private updateStats(): void {
        const contactCountElement = document.getElementById('contactCount') as HTMLElement;
        if (contactCountElement) {
            contactCountElement.textContent = this.contacts.length.toString();
        }
    }
}


const contactManager = new ContactManager();


function openAddModal(): void {
    contactManager.openAddModal();
}

function closeModal(): void {
    contactManager.closeModal();
}