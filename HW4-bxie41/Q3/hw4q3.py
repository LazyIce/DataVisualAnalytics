## Data and Visual Analytics - Homework 4
## Georgia Institute of Technology
## Applying ML algorithms to detect seizure

import numpy as np
import pandas as pd
import time

from sklearn.model_selection import cross_val_score, GridSearchCV, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.svm import SVC
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, normalize

######################################### Reading and Splitting the Data ###############################################
# XXX
# TODO: Read in all the data. Replace the 'xxx' with the path to the data set.
# XXX
data = pd.read_csv('seizure_dataset.csv')

# Separate out the x_data and y_data.
x_data = data.loc[:, data.columns != "y"]
y_data = data.loc[:, "y"]

# The random state to use while splitting the data.
random_state = 100

# XXX
# TODO: Split 70% of the data into training and 30% into test sets. Call them x_train, x_test, y_train and y_test.
# Use the train_test_split method in sklearn with the paramater 'shuffle' set to true and the 'random_state' set to 100.
# XXX
x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.3, shuffle=True, random_state=random_state)

# ############################################### Linear Regression ###################################################
# XXX
# TODO: Create a LinearRegression classifier and train it.
# XXX
linear_clf = LinearRegression()
linear_clf.fit(x_train, y_train)
# XXX
# TODO: Test its accuracy (on the training set) using the accuracy_score method.
# TODO: Test its accuracy (on the testing set) using the accuracy_score method.
# Note: Use y_predict.round() to get 1 or 0 as the output.
# XXX
lr_train_acc = accuracy_score(y_train, linear_clf.predict(x_train).round())
lr_test_arc = accuracy_score(y_test, linear_clf.predict(x_test).round())
print((lr_train_acc * 100).round(), (lr_test_arc * 100).round())
# ############################################### Multi Layer Perceptron #################################################
# XXX
# TODO: Create an MLPClassifier and train it.
# XXX
mlp_clf = MLPClassifier()
mlp_clf.fit(x_train, y_train)
# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
# TODO: Test its accuracy on the test set using the accuracy_score method.
# XXX
mlp_train_acc = accuracy_score(y_train, mlp_clf.predict(x_train))
mlp_test_acc = accuracy_score(y_test, mlp_clf.predict(x_test))
print((mlp_train_acc * 100).round(), (mlp_test_acc * 100).round())

# ############################################### Random Forest Classifier ##############################################
# XXX
# TODO: Create a RandomForestClassifier and train it.
# XXX
rm_clf = RandomForestClassifier()
rm_clf.fit(x_train, y_train)
# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
# TODO: Test its accuracy on the test set using the accuracy_score method.
# XXX
rm_train_acc = accuracy_score(y_train, rm_clf.predict(x_train))
rm_test_acc = accuracy_score(y_test, rm_clf.predict(x_test))
print((rm_train_acc * 100).round(), (rm_test_acc * 100).round())
# XXX
# TODO: Tune the hyper-parameters 'n_estimators' and 'max_depth'.
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
# XXX
rm_params = [
    {'n_estimators': range(10, 71, 10), 'max_depth': range(3, 14, 2)},
]
rm_gsearch = GridSearchCV(estimator=RandomForestClassifier(), param_grid=rm_params)
rm_gsearch.fit(x_train, y_train)
print(rm_gsearch.best_params_, rm_gsearch.best_score_)

# ############################################ Support Vector Machine ###################################################
# XXX
# TODO: Pre-process the data to standardize or normalize it, otherwise the grid search will take much longer
# TODO: Create a SVC classifier and train it.
# XXX
ss = StandardScaler()
x_train = ss.fit_transform(x_train)
x_test = ss.transform(x_test)

svc_clf = SVC()
svc_clf.fit(x_train, y_train)
# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
# TODO: Test its accuracy on the test set using the accuracy_score method.
# XXX
svc_train_acc = accuracy_score(y_train, svc_clf.predict(x_train))
svc_test_acc = accuracy_score(y_test, svc_clf.predict(x_test))
print((svc_train_acc * 100).round(), (svc_test_acc * 100).round())
# XXX
# TODO: Tune the hyper-parameters 'C' and 'kernel' (use rbf and linear).
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
# XXX
svc_params = [
    {'kernel': ['rbf', 'linear'], 'C': [0.001, 0.01, 0.1, 1]}
]
svc_search = GridSearchCV(estimator=SVC(), param_grid=svc_params, cv=10)
svc_search.fit(x_train, y_train)
print(svc_search.best_params_, svc_search.best_score_)

cv_results = cross_validate(SVC(kernel='rbf', C=1), x_train, y_train, cv=10, scoring='accuracy', return_train_score=True)
print('mean training score: ', np.mean(cv_results['train_score']))
print('mean testing score: ', np.mean(cv_results['test_score']))
print('mean fit time: ', np.mean(cv_results['fit_time']))
