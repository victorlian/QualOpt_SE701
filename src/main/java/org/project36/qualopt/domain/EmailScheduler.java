package org.project36.qualopt.domain;

import org.quartz.Job;
import org.quartz.JobKey;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import javax.mail.MessagingException;
import javax.mail.Transport;
import javax.mail.internet.MimeMessage; 

public class EmailScheduler implements Job {

    public EmailScheduler() {
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException
    {

        JobDataMap dataMap = context.getJobDetail().getJobDataMap();
        // TODO: use instance of instead of the cast.
        MimeMessage msg = (MimeMessage)dataMap.get("message");

        try {
            Transport.send(msg);
        } catch (MessagingException e){
            e.printStackTrace();
        }
    }
  }