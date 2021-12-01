import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { EmployeeModel } from './model/employee.model';
import { Employee } from './model/employee.model';
import { Status } from './model/employee.model';
import { DatePipe, formatDate } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  display = 'none';
  jsonData: EmployeeModel = { employee: [] };
  employeeList: Employee[] = [];
  employeeListCopy: Employee[] = [];
  statusKeys: any = Object.keys(Status).filter((number) => isNaN(parseInt(number)));
  currentStatus:any = "ALL";
  currentAction:any = "Add"
  allList: Employee[] = [];
  activeList: Employee[] = [];
  inactiveList: Employee[] = [];

  employeeForm = new FormGroup({});
  employeeObj = { name: '', status: 0, date: '', selected: false };

  myDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  editIndex:number = -1;
  editEmployeeName: string = '';

  allSelected: boolean = false;


  constructor(private _emp: EmployeeService, private formBuilder: FormBuilder, public datePipe: DatePipe) { 
    //initialize form
   this.initForm();
  }

  ngOnInit() {
    this._emp.getEmployeeData().subscribe(
      {
        next: (v: EmployeeModel) => {
          this.jsonData = v;
          this.employeeList = this.jsonData.employee;
          this.employeeListCopy = this.employeeList;
          this.initData();
        },
        error: (e) => console.error(e),
        complete: () => console.info('complete'),
      }
      );
    }

  initForm() {

    this.employeeForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      active: new FormControl(true),
      date: [this.myDate, Validators.required]
    });
  }

  get name() {
    return this.employeeForm.get('name');
  }

  get active() {
    return this.employeeForm.get('active');
  }

  get date() {
    return this.employeeForm.get('date')?.value;
  }

 
  get employeeNames(){
    return this.allList.map(item => item.name);
  }

  get selected(){
    return this.employeeList.filter((item) => item.selected == true);
  }

  onSubmit() {
    if(this.currentAction == "Add"){
      this.resetEmpObject
      let name = this.name?.value;
      let active = this.active?.value;
      let date = this.datePipe.transform(this.date, 'EEE MMM dd yyyy hh:mm:ss');
      this.employeeList = this.employeeListCopy;
        if (!this.employeeNames.includes(name) ) {
          this.addEmployee(name, active, date);
        }
        this.resetEmpObject
        this.initForm();
        this.employeeListCopy = this.employeeList;
        this.initData();
    } 

    else if(this.currentAction == "Edit"){
      this.employeeObj.name = String(this.name?.value);
      this.employeeObj.status = Number(+this.active?.value);
      this.employeeObj.date = String(this.date);
      this.employeeList = this.employeeListCopy;
      if(!this.employeeNames.includes(this.employeeObj.name)){
        this.editEmployee(this.employeeObj);
      }
      else if(this.editEmployeeName == this.name?.value){
        this.editEmployee(this.employeeObj);
      }
      this.resetEmpObject
      this.employeeForm.setControl('name', new FormControl('', Validators.required));
      this.employeeListCopy = this.employeeList;
      this.initData();
    }
  }

  addEmployee(name: any, active: any, date: any) {
    this.employeeObj.name = name;
    this.employeeObj.status = Number(+active);
    this.employeeObj.date = date;
    this.employeeList = [...this.employeeList, this.employeeObj];
    this.onCloseHandled();
  }

  editEmployee(emp:any){
      this.employeeList[this.editIndex] = emp;
      this.onCloseHandled();
  }

  removeEmployee(emp:any) {
    //find employee and remove from the list
    this.employeeList = this.allList.filter((item) => item.name != emp.name);
    this.employeeListCopy = this.employeeList;
    this.initData();
  }
    
    initData() {
      this.activeList = this.setData("ACTIVE");
      this.inactiveList = this.setData("INACTIVE");
      this.allList = this.setData("ALL");
      this.employeeList = this.setData(this.currentStatus);
    }
    
    onStatusChange(status: any) {
      this.currentStatus = status;
      this.resetSelected();
      this.setData(status);
    }

    setData(status: any) {
      this.employeeList = this.employeeListCopy;
      if (status == "ACTIVE") {
        return this.employeeList = this.employeeList.filter((item) => item.status == Status.ACTIVE);
      } else if(status == "INACTIVE") {
        return this.employeeList = this.employeeList.filter((item) => item.status == Status.INACTIVE);
      }
      else{
        return this.employeeList;
      }
      
    }

    resetSelected(){
      this.employeeList = this.employeeList.map((item) => {
        item.selected = false;
        return item;
      });
      this.allSelected = false;
    }
    
    isChecked(item:any){
      if(item == this.currentStatus){
        return true
      }
      else{
        return false
      }
    }

    resetEmpObject(){
      this.employeeObj = { name: '', status: 0, date: '', selected: false };
    }
    
    openModal(action:any, emp?:any) {
      this.resetEmpObject
      this.initForm();
      if(action == "Add"){
       this.currentAction = "Add";
      }
      if(action == "Edit"){
        this.currentAction = "Edit";
        this.employeeObj.name = emp.name;
        this.employeeObj.status = emp.status;
        this.employeeObj.date = String(this.datePipe.transform(emp.date, 'yyyy-MM-dd'));
        //'EEE MMM dd yyyy hh:mm:ss'
        this.employeeForm.patchValue({
          name:this.employeeObj.name,
          active:this.employeeObj.status,
          date:this.employeeObj.date
        });
        this.editIndex = this.allList.findIndex(item => item.name == emp.name);
        this.editEmployeeName = this.allList[this.editIndex].name;
      }
      this.display = 'block';
    }
    
    onCloseHandled() {
      this.display = 'none';
    }
    
    onSelectAll(event:any) {
      let allSelected = event.target.checked;
      this.employeeList.map(item => item.selected = allSelected);      
    }

    onSelect(event:any) {
      let checked = event.target.checked;
      let index = event.target.value;
      this.employeeList[index].selected = checked;
      if(this.selected.length == this.employeeList.length ){
        this.allSelected = true;
      }
      else{
        this.allSelected = false;
      }
    }

    deleteSelected(){
      this.employeeList = this.allList.filter((item) => item.selected == false);
      this.employeeListCopy = this.employeeList;
      this.initData();
    }

    get deleteValid(){
      return this.selected.length == 0;
    }
}
