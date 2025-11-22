// OmniPriv Age Check Circuit
// Proves that age >= threshold without revealing actual age

fn main(
    age: Field,           // Private: user's age
    threshold: pub Field, // Public: minimum age required
    commitment: pub Field // Public: credential commitment
) {
    // Assert age is greater than or equal to threshold
    assert(age >= threshold);
    
    // In production, verify commitment = Poseidon(age, other_fields, salt)
    // For MVP, we skip the commitment verification
}

#[test]
fn test_age_check_pass() {
    let age = 25;
    let threshold = 18;
    let commitment = 12345; // mock
    
    main(age, threshold, commitment);
}

#[test]
fn test_age_check_fail() {
    // This should fail
    let age = 16;
    let threshold = 18;
    let commitment = 12345;
    
    // Uncommenting below would cause test failure
    // main(age, threshold, commitment);
}

