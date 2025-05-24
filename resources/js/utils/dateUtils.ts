// Utility functions for date calculations

export const calculateAge = (dateOfBirth: string | Date): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

export const isValidTeacherAge = (dateOfBirth: string | Date): boolean => {
    const age = calculateAge(dateOfBirth);
    return age >= 20 && age <= 50;
};

export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
};

export const isValidPhoneNumber = (phone: string): boolean => {
    // Check if phone contains only numbers and has appropriate length
    const numericPhone = formatPhoneNumber(phone);
    return numericPhone.length == 10;
};
