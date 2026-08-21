package com.vardhiin.inventory.enums;

public enum OrderStatus {
    DRAFT,      // editable, only visible to creator
    SUBMITTED,  // locked, visible to purchaser queue
    COMPLETED,  // purchaser executed the txn offline and recorded a reference
    REJECTED    // purchaser rejected with a note; terminal in v1 (no resubmission)
}
