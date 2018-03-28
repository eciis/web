"use strict";

function Address(data={}) {
    data.city = data.city || "";
    data.country = data.country || "";
    data.federal_state = data.federal_state || "";
    data.neighbourhood = data.neighbourhood || "";
    data.street = data.street || "";
    data.cep = data.cep || "";
    data.number = data.number || "";

    _.extend(this, data);
}