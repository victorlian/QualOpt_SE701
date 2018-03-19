import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { EmailTemplate } from './emailTemplate/emailTemplate.model' 
import { EmailTemplateService } from './emailTemplate/emailTemplate.service' 

import { Study } from './study.model';
import { StudyPopupService } from './study-popup.service';
import { StudyService } from './study.service';
import { User, UserService, ResponseWrapper, Principal, Account } from '../../shared';
import { Participant, ParticipantService } from '../participant';

@Component({
    selector: 'jhi-study-dialog',
    templateUrl: './study-dialog.component.html',
    providers: [EmailTemplateService]
})
export class StudyDialogComponent implements OnInit {

    study: Study;
    isSaving: boolean;

    users: User[];

    participants: Participant[];

    templates: EmailTemplate[];
    selectedTemplate: EmailTemplate;

    saveTemplateName: string;
    selectedManageTemplate: EmailTemplate;
    manageTemplateSubject: string;
    manageTemplateBody: string;

    account: Account;
    currentUser: User;

    constructor(
        public activeModal: NgbActiveModal,
        private dataUtils: JhiDataUtils,
        private alertService: JhiAlertService,
        private studyService: StudyService,
        private emailTemplateService: EmailTemplateService,
        private userService: UserService,
        private participantService: ParticipantService,
        private eventManager: JhiEventManager,
        private principal: Principal,
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.userService.query()
            .subscribe((res: ResponseWrapper) => { this.users = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.participantService.query()
            .subscribe((res: ResponseWrapper) => { this.participants = res.json; }, (res: ResponseWrapper) => this.onError(res.json));

        //retrieve account information of current user
        this.principal.identity().then((account) => {
            this.account = account;
            this.getAndUpdateEmailTemplate();
            //use the account information to get the current user
            this.userService.find(account.login).subscribe((user) => {
                this.currentUser = user;
            });
        });
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    setFileData(event, study, field, isImage) {
        if (event && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (isImage && !/^image\//.test(file.type)) {
                return;
            }
            this.dataUtils.toBase64(file, (base64Data) => {
                study[field] = base64Data;
                study[`${field}ContentType`] = file.type;
            });
        }
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.study.id !== undefined) {
            this.subscribeToSaveResponse(
                this.studyService.update(this.study));
        } else {
            this.subscribeToSaveResponse(
                this.studyService.create(this.study));
        }
    }

    changeTab(tab) {
        document.getElementById(tab).click();
    }

    getAndUpdateEmailTemplate() {
        this.emailTemplateService.get(this.account.login).subscribe((templates) => {
            this.templates = templates;

            //adding the blank template and default template at index 0, 1.
            let blankTemplate = new EmailTemplate(-1, "none", "", "");
            this.templates.splice(0, 0, blankTemplate)
            this.selectedTemplate = this.templates[0];
            this.selectedManageTemplate = this.templates[0];
            let defaultTemplate = new EmailTemplate
                (0, "default", "Hi from QualOpt", "Dear participant: \n\n     We ask you kindly to join our study. \n\nYour QualOpt Team")
            this.templates.splice(1, 0, defaultTemplate);
        });
    }

    clearSubjectAndBodyInManage() {
        this.manageTemplateSubject = "";
        this.manageTemplateBody = "";
    }

    updateTemplateOperationStatusMessage(message: string){
        (<HTMLLabelElement>document.getElementById("statusMessage")).innerHTML = message;
        //clear the message after 3 seconds.
        setTimeout(function () {
            if (<HTMLLabelElement>document.getElementById("statusMessage") !== null) {
                (<HTMLLabelElement>document.getElementById("statusMessage")).innerHTML = "";
            }
        }, 3000);
    }

    onTemplateChange(newValue: EmailTemplate) {
        this.selectedTemplate = newValue;
        this.study.emailSubject = newValue.subject;
        this.study.emailBody = newValue.body;
    }

    onManageTemplateChange(newValue: EmailTemplate){
        this.selectedManageTemplate = newValue;
        this.manageTemplateSubject = newValue.subject;
        this.manageTemplateBody = newValue.body;
    }
    
    saveTemplate() {
        //check for empty name
        if (this.saveTemplateName === undefined || this.saveTemplateName.trim() === ""){
            this.updateTemplateOperationStatusMessage("A template must be saved with a name.");
            return;
        }
        
        //check for existing name
        let existingNames = this.templates.map(t => t.name);
        if (existingNames.indexOf(this.saveTemplateName) > -1){
            this.updateTemplateOperationStatusMessage("This template name has already been used.");
            return;
        }


        let newEmailTemplate = new EmailTemplate(null, this.saveTemplateName, this.manageTemplateSubject, this.manageTemplateBody, this.currentUser);
        this.emailTemplateService.create(newEmailTemplate).subscribe((res: EmailTemplate) => {
            this.getAndUpdateEmailTemplate();
        });
        this.saveTemplateName = undefined;
    }

    updateTemplate(){
        //Do not attempt to update non-existing template or the "none" template.
        if (this.selectedManageTemplate.id < 1 || this.selectedManageTemplate.id === undefined){
            this.updateTemplateOperationStatusMessage("Cannot update default or non-existing template.");
            return;
        }

        let updatedEmailTemplate = new EmailTemplate
            (this.selectedManageTemplate.id, this.selectedManageTemplate.name, this.manageTemplateSubject, this.manageTemplateBody, this.currentUser);

        this.emailTemplateService.update(updatedEmailTemplate).subscribe((response) => {
            this.getAndUpdateEmailTemplate();
        });
    }

    deleteTemplate() {
        //Do not attempt to delete non-existing template or the "none" template.
        if (this.selectedManageTemplate.id < 1 || this.selectedManageTemplate.id === undefined){
            this.updateTemplateOperationStatusMessage("Cannot delete default or non-existing template.");
            return;
        }

        this.emailTemplateService.delete(this.selectedManageTemplate.id).subscribe((response) => {
            this.getAndUpdateEmailTemplate();
            this.clearSubjectAndBodyInManage();
        });
    }

    private subscribeToSaveResponse(result: Observable<Study>) {
        result.subscribe((res: Study) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Study) {
        this.eventManager.broadcast({ name: 'studyListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }

    trackUserById(index: number, item: User) {
        return item.id;
    }

    trackParticipantById(index: number, item: Participant) {
        return item.id;
    }

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }

    getTitle() {
        if ( this.study.id != null ) {
            return 'Edit Study';
        }else {
            return 'Create Study';
        }
    }
}

@Component({
    selector: 'jhi-study-popup',
    template: ''
})
export class StudyPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private studyPopupService: StudyPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                if (this.route.snapshot.data.copy) {
                    this.studyPopupService
                    .copy(StudyDialogComponent as Component, params['id'])
                } else {
                    this.studyPopupService
                    .open(StudyDialogComponent as Component, params['id']);
                }
            } else {
                this.studyPopupService
                    .open(StudyDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
