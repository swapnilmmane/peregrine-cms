package com.peregrine.nodetypes.models;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;

import java.util.Map;

@Model(adaptables = Resource.class, resourceType = {
        "nt:unstructured"
}, adapters = IComponent.class)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_EMPTY)
public class NtUnstructuredModel extends Container {

    public NtUnstructuredModel(Resource r) {
        super(r);
    }

    @JsonIgnore(value = false)
    public String getName() {
        return getResource().getName();
    }

    @JsonAnyGetter
    public Map valueMap() {
        return getResource().getValueMap();
    }

}
