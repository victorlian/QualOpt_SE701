package org.project36.qualopt.service;

import org.project36.qualopt.domain.EmailScheduler;
import org.apache.commons.lang3.CharEncoding;
import org.project36.qualopt.domain.Study;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import java.util.Date;
import java.util.Objects;
import java.util.Properties;

import org.quartz.SchedulerFactory;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.DateBuilder.IntervalUnit;

import static org.quartz.DateBuilder.futureDate;
import static org.quartz.TriggerBuilder.newTrigger;
import static org.quartz.JobBuilder.newJob;


@Service
public class StudyService {

    private static final Logger log = LoggerFactory.getLogger(StudyService.class);

    private final JavaMailSenderImpl javaMailSender;

    public StudyService(JavaMailSenderImpl javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendInvitationEmail(Study study, int delay){
        log.debug("Sending invitation email for study '{}'", study);

        String subject = study.getEmailSubject();
        String content = Objects.isNull(study.getEmailBody()) ? "" : study.getEmailBody();
        String userEmail = study.getUser().getEmail();
        try {
            javaMailSender.setSession(getUserEmailSession());
            MimeMessage message = javaMailSender.createMimeMessage();
            message.setFrom(new InternetAddress(userEmail));
            message.addRecipients(Message.RecipientType.TO, study
                .getParticipants()
                .stream()
                .map(participant -> {
                    try {
                        return new InternetAddress(participant.getEmail());
                    } catch (AddressException e) {
                        log.error("Failed to create internet address from participant email", e);
                        throw new RuntimeException(e);
                    }
                })
                .toArray(Address[]::new));
            message.setSubject(subject, CharEncoding.UTF_8);
            message.setText(content, CharEncoding.UTF_8);
            if (delay > 0){
                try {
                    scheduleEmailJob(message, delay);
                } catch (SchedulerException se){
                    log.error("Failed to schedule email", se);
                    se.printStackTrace();
                }
                
            } else {
                javaMailSender.send(message);
            }
            
            log.debug("Sent invitation email for study '{}'", study);
        } catch (MessagingException e) {
            log.error("Failed to send invitation email", e);
        }
    }

    private Session getUserEmailSession(){
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        // trust the host gmail; prevents antivirus from blocking emails being sent
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        return Session.getInstance(props,
            new javax.mail.Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    // dev test gmail account for proof of concept
                    // TODO authenticate user email and use that instead. i.e. study.getUser().getEmail()
                    return new PasswordAuthentication("tt7199425@gmail.com", "testemail123");
                }
            });
    }

    private void scheduleEmailJob(MimeMessage message, int delay) throws SchedulerException {
        
        SchedulerFactory schedFact = new StdSchedulerFactory();

        Scheduler sched = schedFact.getScheduler();

        sched.start();
        JobDataMap messageMap = new JobDataMap();
        messageMap.put("message", message);

        // define the job and tie it to our HelloJob class
        JobDetail job = newJob(EmailScheduler.class)
            .withIdentity("myJob", "group1")
            .usingJobData(messageMap)
            .build();

        // Trigger the job to run now, and then every 40 seconds
        Trigger trigger = newTrigger().withIdentity("myTrigger", "group1")
        .startAt(futureDate(delay,IntervalUnit.SECOND))
            .forJob(job)
            .build();

        // Tell quartz to schedule the job using our trigger
        sched.scheduleJob(job, trigger);
    }
}
