from flask import Flask, render_template, request, json

app = Flask(__name__)


@app.route('/')
def hello():
    return render_template('hello.html')


@app.route('/signUp')
def signUp():
    return render_template('signUp.html')


@app.route('/signUpUser', methods=['POST'])
def signUpUser():
    user = request.form['username']
    password = request.form['password']
    result = isValid(password)
    if len(result) == 0:
        return json.dumps({'status': 'OK', 'user': user, 'pass': password})
    else:
        return json.dumps({'status': 'BAD', 'user': user, 'pass': result})


def isValid(password):
    criteria = []
    hasUpper = False
    hasDigit = False
    if len(password) < 8:
        criteria.append(1)
    for letter in password:
        if letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
            hasUpper = True
        if letter in '0123456789':
            hasDigit = True
    if not hasUpper:
        criteria.append(2)
    if not hasDigit:
        criteria.append(3)
    return criteria


if __name__ == "__main__":
    app.run()
