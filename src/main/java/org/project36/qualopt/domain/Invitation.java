package org.project36.qualopt.domain;

import java.io.Serializable;

import org.project36.qualopt.domain.Study;
/**
 * The invitation class is a domain class that is NOT MAPPED
 * and is used to pass a study object along with the delay to
 * the resource method.
 */
public class Invitation implements Serializable {
    private static final long serialVersionUID = 1L;

    private Study study;
    private String delay;

    /**
     * @return the study
     */
    public Study getStudy() {
        return study;
    }
    /**
     * @param study the study to set
     */
    public void setStudy(Study study) {
        this.study = study;
    }

    /**
     * @return the delay
     */
    public String getDelay() {
        return delay;
    }
    /**
     * @param delay the delay to set
     */
    public void setDelay(String delay) {
        this.delay = delay;
    }
    
 }