package org.project36.qualopt.domain;
import java.io.Serializable;

public class StudyDelay implements Serializable {

    private static final long serialVersionUID = 1L;

    private Study study;

    private String delay;

    public StudyDelay(Study study, String delay){
        this.study = study;
        this.delay = delay;
    }
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