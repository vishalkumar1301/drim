function signupValidation(username_, email_, password1_, password2_) {
    this.username = username_;
    this.email = email_;
    this.password1 = password1_;
    this.password2 = password2_;
    this.isUsernameValid = function () {
        if(this.username != "") {
            return true;
        }
        return false;
    }
    this.isEmailValid = function () {
        if(this.email != "" && this.email.includes("@") >=0 ) {
            return true;
        }
        return false;
    }
    this.isPasswordValid = function () {
        if((this.password1 != "") && (this.password1 == this.password2)) {
            return true;
        }
        return false;
    }
    this.isSignupFormValid = function () {
        if(this.isUsernameValid() && this.isEmailValid() &&  this.isPasswordValid()) {
            return true;
        }
        return false;
    }
}
