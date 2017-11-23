function signinValidation(username_, password_) {
    this.username = username_;
    this.password = password_;
    this.isUsernameValid = function () {
        if(this.username != "") {
            return true;
        }
        return false;
    }
    this.isPasswordValid = function () {
        if(this.password != "") {
            return true;
        }
        return false;
    }
    this.isSigninFormValid = function () {
        if(this.isUsernameValid() &&  this.isPasswordValid()) {
            return true;
        }
        return false;
    }
}
