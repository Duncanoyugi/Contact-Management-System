interface IContact {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    company?: string;
    notes?: string;
}
declare class Contact implements IContact {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
    notes: string;
    constructor(firstName: string, lastName: string, phone: string, email?: string, company?: string, notes?: string, id?: string);
    private generateId;
    get fullName(): string;
    get initials(): string;
    update(updatedContact: Partial<IContact>): void;
    matchesSearch(searchTerm: string): boolean;
}
export { Contact };
export type { IContact };
//# sourceMappingURL=contact.d.ts.map