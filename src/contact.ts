// Contact interface
interface IContact {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    company?: string;
    notes?: string;
}

// Contact class implementing the interface
class Contact implements IContact {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
    notes: string;

    constructor(
        firstName: string,
        lastName: string,
        phone: string,
        email: string = '',
        company: string = '',
        notes: string = '',
        id: string = ''
    ) {
        this.id = id || this.generateId();
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.company = company;
        this.notes = notes;
    }

    // Generate a unique ID for each contact
    private generateId(): string {
        return 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get full name
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    // Get initials for avatar
    get initials(): string {
        return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
    }

    // Update contact details
    update(updatedContact: Partial<IContact>): void {
        Object.assign(this, updatedContact);
    }

    // Check if contact matches search term
    matchesSearch(searchTerm: string): boolean {
        const term = searchTerm.toLowerCase();
        return (
            this.firstName.toLowerCase().includes(term) ||
            this.lastName.toLowerCase().includes(term) ||
            this.phone.includes(term) ||
            (!!this.email && this.email.toLowerCase().includes(term)) ||
            (!!this.company && this.company.toLowerCase().includes(term))
        );
    }
}

export { Contact };
export type { IContact };
