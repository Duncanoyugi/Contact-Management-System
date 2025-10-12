import { Contact, type IContact } from './contact.js';

// Storage service for handling localStorage operations
class StorageService {
    private readonly storageKey = 'contacts';

    // Get all contacts from localStorage
    getContacts(): Contact[] {
        try {
            const contactsJson = localStorage.getItem(this.storageKey);
            if (!contactsJson) return [];

            const contactsData: IContact[] = JSON.parse(contactsJson);
            return contactsData.map(data =>
                new Contact(
                    data.firstName,
                    data.lastName,
                    data.phone,
                    data.email,
                    data.company,
                    data.notes,
                    data.id
                )
            );
        } catch (error) {
            console.error('Error loading contacts from storage:', error);
            return [];
        }
    }

    // Save contacts to localStorage
    saveContacts(contacts: Contact[]): void {
        try {
            const contactsData: IContact[] = contacts.map(contact => ({
                id: contact.id,
                firstName: contact.firstName,
                lastName: contact.lastName,
                phone: contact.phone,
                email: contact.email,
                company: contact.company,
                notes: contact.notes
            }));

            localStorage.setItem(this.storageKey, JSON.stringify(contactsData));
        } catch (error) {
            console.error('Error saving contacts to storage:', error);
        }
    }

    // Add a new contact
    addContact(contact: Contact): void {
        const contacts = this.getContacts();
        contacts.push(contact);
        this.saveContacts(contacts);
    }

    // Update an existing contact
    updateContact(updatedContact: Contact): void {
        const contacts = this.getContacts();
        const index = contacts.findIndex(contact => contact.id === updatedContact.id);

        if (index !== -1) {
            contacts[index] = updatedContact;
            this.saveContacts(contacts);
        }
    }

    // Delete a contact by ID
    deleteContact(contactId: string): void {
        const contacts = this.getContacts();
        const filteredContacts = contacts.filter(contact => contact.id !== contactId);
        this.saveContacts(filteredContacts);
    }

    // Get a contact by ID
    getContactById(contactId: string): Contact | undefined {
        const contacts = this.getContacts();
        return contacts.find(contact => contact.id === contactId);
    }
}

export { StorageService };
