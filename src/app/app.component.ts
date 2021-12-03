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
  employeeObj = { name: '', status: 0, date: '', selected: false, image: '' };

  myDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  editIndex:number = -1;
  editEmployeeName: string = '';

  allSelected: boolean = false;
  eSorting: boolean = false;
  dSorting: boolean = false;

  fileString: String = "";

  constructor(private _emp: EmployeeService, private formBuilder: FormBuilder, public datePipe: DatePipe) { 
    //initialize form
   this.initForm();
  }

  ngOnInit() {
    if(localStorage.length > 0){
      var data = JSON.parse(localStorage.getItem('employeeList') || '[]');
      this.employeeList = data.employee;
    }
    else{
      console.log("localStorage is empty");
      localStorage.setItem('employeeList', JSON.stringify(
        {
          "employee": [
            {
              "name": "Employee 1",
              "status": 1,
              "date": "Wed Mar 10 2021 00:00:00",
              "selected":false,
              "image":"../assets/img/emp1.jpg"
            },
            {
              "name": "Employee 2",
              "status": 0,
              "date": "Fri Oct 15 2021 00:00:00",
              "selected":false,
              "image":"../assets/img/emp2.jpg"
            },
            {
              "name": "Employee 3",
              "status": 1,
              "date": "Thu Sep 23 2010 00:00:00",
              "selected":false,
              "image":"../assets/img/emp3.jpg"
            },
            {
              "name": "Employee 4",
              "status": 1,
              "date": "Fri May 10 2002 00:00:00",
              "selected":false,
              "image":"../assets/img/emp4.jpg"
            },
            {
              "name": "Employee 5",
              "status": 0,
              "date": "Wed Mar 10 2021 00:00:00",
              "selected":false,
              "image":"../assets/img/emp5.jpg"
            }
          ]
      }  
      ));
      var data = JSON.parse(localStorage.getItem('employeeList') || '[]');
      this.employeeList = data.employee;
    }
    console.log(this.employeeList)
    this.employeeListCopy = this.employeeList;
    this.initData();
    }

  sortEmp(){
      this.eSorting ? 
                      this.employeeList = this.employeeList.sort((a, b) => a.name.localeCompare(b.name)) 
                    :
                      this.employeeList = this.employeeList.sort((a, b) => b.name.localeCompare(a.name));
    }

  sortDate(){
      this.dSorting ? 
                      this.employeeList = this.employeeList.sort((a, b) => {
                           return Date.parse(a.date) - Date.parse(b.date);
                      })
                    :
                      this.employeeList = this.employeeList.sort((a, b) => {
                          return Date.parse(b.date) - Date.parse(a.date);
                      });
    }

  initForm() {
    this.employeeForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      active: new FormControl(true),
      date: [this.myDate, Validators.required],
      image: new FormControl('',Validators.required)
    });
  }

  onFileChange(event:any) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.fileString = reader.result as string;
      this.employeeForm.patchValue({
        image: this.fileString
      })
    }
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

  get image() {
    return this.employeeForm.get('image')?.value;
  }

  get employeeNames(){
    return this.allList.map(item => item.name);
  }

  get selected(){
    return this.employeeList.filter((item) => item.selected == true);
  }

  resetFrom(){
    this.employeeForm.patchValue({
      name: '',
      active: true,
      date: this.myDate,
      image: ''
    });
    this.employeeForm.reset();
  }

  onSubmit() {

    if(this.currentAction == "Add"){
      this.resetEmpObject();
      let name = this.name?.value;
      let active = this.active?.value;
      let date = this.datePipe.transform(this.date, 'EEE MMM dd yyyy hh:mm:ss');
      let image = String(this.image);
      
      this.employeeList = this.employeeListCopy;
        if (!this.employeeNames.includes(name) ) {
          this.addEmployee(name, active, date, image);
        }
      console.log(this.employeeList);

        this.resetEmpObject
        this.initForm();
        this.employeeListCopy = this.employeeList;
        this.initData();
    } 

    else if(this.currentAction == "Edit"){
      this.employeeObj.name = String(this.name?.value);
      this.employeeObj.status = Number(+this.active?.value);
      this.employeeObj.date = String(this.date);
      this.employeeObj.image = String(this.employeeForm.get('image')?.value);
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
      localStorage.setItem('employeeList', JSON.stringify(this.employeeList));
      this.initData();
    }

  }

  addEmployee(name: any, active: any, date: any, image: any) {
    this.employeeObj.name = name;
    this.employeeObj.status = Number(+active);
    this.employeeObj.date = date;
    this.employeeObj.image = image;
    this.employeeList = [...this.employeeList, this.employeeObj];
    localStorage.setItem('employeeList', JSON.stringify(this.employeeList));
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
    localStorage.setItem('employeeList', JSON.stringify(this.employeeList));
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
      this.employeeObj = { name: '', status: 0, date: '', selected: false, image: '' };
    }
    
    openModal(action:any, emp?:any) {
      this.resetEmpObject();
      this.initForm();
      if(action == "Add"){
       this.currentAction = "Add";
       this.initForm();
      }
      if(action == "Edit"){
        console.log(emp);
        this.currentAction = "Edit";
        this.employeeObj.name = emp.name;
        this.employeeObj.status = emp.status;
        this.employeeObj.date = String(this.datePipe.transform(emp.date, 'yyyy-MM-dd'));
        this.employeeObj.image = emp.image;
        //'EEE MMM dd yyyy hh:mm:ss'
        this.employeeForm.patchValue({
          name:this.employeeObj.name,
          active:this.employeeObj.status,
          date:this.employeeObj.date,
          image:this.employeeObj.image
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
