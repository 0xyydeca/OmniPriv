/**
 * Predicate evaluation for credential checking
 * 
 * MVP implementation: Simple predicate checking
 * Production: Would use more sophisticated rule engine
 */

export interface Predicate {
  type: 'age' | 'country' | 'kyc';
  operator?: 'gte' | 'lte' | 'eq' | 'in' | 'not_in';
  value?: number | string | string[];
}

export interface CredentialData {
  dob_year?: number;
  age?: number;
  country_code?: number;
  country?: string;
  kyc_status?: string;
  [key: string]: any;
}

/**
 * Evaluate a predicate against credential data
 * 
 * @param data - Credential data to check
 * @param predicate - Predicate to evaluate
 * @returns boolean indicating if predicate passes
 */
export function evaluatePredicate(
  data: CredentialData,
  predicate: Predicate
): boolean {
  switch (predicate.type) {
    case 'age': {
      const age = data.age || (data.dob_year ? new Date().getFullYear() - data.dob_year : 0);
      const threshold = predicate.value as number;
      
      switch (predicate.operator) {
        case 'gte':
          return age >= threshold;
        case 'lte':
          return age <= threshold;
        case 'eq':
          return age === threshold;
        default:
          return age >= threshold; // Default to gte
      }
    }
    
    case 'country': {
      const country = data.country || '';
      const allowedCountries = predicate.value as string[];
      
      switch (predicate.operator) {
        case 'in':
          return allowedCountries.includes(country);
        case 'not_in':
          return !allowedCountries.includes(country);
        case 'eq':
          return country === predicate.value;
        default:
          return allowedCountries.includes(country);
      }
    }
    
    case 'kyc': {
      const status = data.kyc_status || '';
      return status === predicate.value;
    }
    
    default:
      return false;
  }
}

