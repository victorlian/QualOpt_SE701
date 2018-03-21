package org.project36.qualopt.web.rest;

import java.io.IOException;
import com.fasterxml.jackson.databind.KeyDeserializer;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.project36.qualopt.domain.Study;


public class MapKeyDeserializer extends KeyDeserializer {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Study deserializeKey(String key, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        System.out.println("attempt to des");
        return mapper.readValue(key, Study.class);
    }
}