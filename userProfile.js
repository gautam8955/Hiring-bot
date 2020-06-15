class UserProfile {
    constructor(name, email, phone, field, experience, comapny_name, position, interview, feedback) {
        //this.transport = transport;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.field = field;
        this.experience = experience;
        this.comapny_name = comapny_name;
        this.position = position;
        this.interview = interview
        this.feedback = feedback;

    }
}

module.exports.UserProfile = UserProfile;
