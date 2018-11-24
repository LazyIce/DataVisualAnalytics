from util import entropy, information_gain, partition_classes
import numpy as np
import ast


class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        # self.tree = []
        # self.tree = {}
        self.tree = []

    def majorClass(self, class_y):
        label_dic = {}
        for label in class_y:
            label_dic[label] = label_dic.get(label, 0) + 1
        sort_label = sorted(label_dic.items(), key=lambda item: item[1])
        return sort_label[-1][0]

    def chooseBestAttr(self, X, y):

        best_split_attr = -1
        best_spilt_value = None
        best_info_gain = -1

        for i in range(len(X[0])):
            attr_list = [dt[i] for dt in X]
            split_list = []
            if isinstance(attr_list[0], str):
                sort_attr_list = sorted(list(set(attr_list)))
                for j in range(len(sort_attr_list)):
                    split_list.append(sort_attr_list[j])
            else:
                a = np.array(attr_list)
                split_list.append(np.mean(a))

            for split_value in split_list:
                partition_res = partition_classes(X, y, i, split_value)
                y_left = partition_res[2]
                y_right = partition_res[3]
                if not y_left or not y_right:
                    continue
                new_info_gain = information_gain(y, [y_left, y_right])
                if new_info_gain > best_info_gain:
                    best_info_gain = new_info_gain
                    best_split_attr = i
                    best_spilt_value = split_value
        return best_split_attr, best_spilt_value

    def buildTree(self, X, y, i):
        node = {'id': i, 'left': 2 * i, 'right': 2 * i + 1, 'split_attr': 0, 'split_value': 0, 'leaf': 'false'}
        count_0 = y.count(0)
        count_1 = y.count(1)
        if count_0 == len(y):
            node['left'] = None
            node['right'] = None
            node['split_attr'] = None
            node['split_value'] = None
            node['leaf'] = 0
            self.tree.append(node)
            return
        elif count_1 == len(y):
            node['left'] = None
            node['right'] = None
            node['split_attr'] = None
            node['split_value'] = None
            node['leaf'] = 1
            self.tree.append(node)
            return
        elif int(np.log2(i))+1 == len(X[0]):
            node['left'] = None
            node['right'] = None
            node['split_attr'] = None
            node['split_value'] = None
            node['leaf'] = self.majorClass(y)
            self.tree.append(node)
            return
        else:
            node['split_attr'], node['split_value'] = self.chooseBestAttr(X, y)
            X_left, X_right, y_left, y_right = partition_classes(X, y, node['split_attr'], node['split_value'])
            self.tree.append(node)
            self.buildTree(X_left, y_left, node['left'])
            self.buildTree(X_right, y_right, node['right'])

    def learn(self, X, y):
        # TODO: Train the decision tree (self.tree) using the the sample X and labels y
        # You will have to make use of the functions in utils.py to train the tree
        
        # One possible way of implementing the tree:
        #    Each node in self.tree could be in the form of a dictionary:
        #       https://docs.python.org/2/library/stdtypes.html#mapping-types-dict
        #    For example, a non-leaf node with two children can have a 'left' key and  a 
        #    'right' key. You can add more keys which might help in classification
        #    (eg. split attribute and split value)
        i = 1
        self.buildTree(X, y, i)

    def classify(self, record):
        # TODO: classify the record using self.tree and return the predicted label
        init_id = 1
        child = 1

        for item in self.tree:
            if item['id'] == init_id:
                if item['right'] is None:
                    return item['leaf']
                if isinstance(record[item['split_attr']], str):
                    if record[item['split_attr']] == item['split_value']:
                        child = item['left']
                    else:
                        child = item['right']
                else:
                    if record[item['split_attr']] <= item['split_value']:
                        child = item['left']
                    else:
                        child = item['right']
            init_id = child
