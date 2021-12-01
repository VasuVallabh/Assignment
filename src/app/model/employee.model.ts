export interface EmployeeModel {
    employee: Employee[];
}

export interface Employee {
    name:   string;
    status: number;
    date:   string;
    selected: boolean;
}

export enum Status {
    ALL = 2,
    ACTIVE = 1,
    INACTIVE = 0,  
}