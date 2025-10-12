import { Contact } from './contact';
declare class StorageService {
    private readonly storageKey;
    getContacts(): Contact[];
    saveContacts(contacts: Contact[]): void;
    addContact(contact: Contact): void;
    updateContact(updatedContact: Contact): void;
    deleteContact(contactId: string): void;
    getContactById(contactId: string): Contact | undefined;
}
export { StorageService };
//# sourceMappingURL=storage.d.ts.map