#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys

from bs4 import BeautifulSoup
import urllib

from datetime import datetime

PROJECT_URL = "https://github.com/eciis/web"

prs = {'bug':[], 'feature': [], 'enhancement': []}

# Add a formated PR in its own category, using the label.
def add_pr(formated_pr, labels):
    for key in prs.iterkeys():
        if key in labels:
            prs[key].append(formated_pr)


def get_page(filter_date, page_number):
    print ">>>> Reading PR's from page %s" % page_number

    # Create buffer and read the URL
    url = urllib.urlopen('%s/pulls?page=%s&q=is:pr+merged:>=%s' % (PROJECT_URL, page_number,filter_date))
    content = url.read()

    # Parse HTML Page
    soup = BeautifulSoup(content, 'html.parser')

    # Search for the div that contains each Pull Request description
    divs = soup.findAll('div',attrs={"class":"float-left col-9 lh-condensed p-2"})

    # Iterate over the divs found (each contains an one PR)
    for div in divs:
        # Search for the component that encapsulate the labels
        labels = div.find('span', attrs={"class": "labels"}).text.strip().split('\n')

        # Search for the component that encapsulate the data under the title
        # PR number, author, date, status, milestone
        data_pr = div.find('span', attrs={"class": "opened-by"}).text

        # Extract the PR number, author and title
        pr_number = data_pr.strip().split('\n')[0]
        pr_author_name = data_pr.strip().split('\n')[1].strip().split(' ')[1]
        pr_title = div.find('a').text.strip().split('\n')[0]

        # Format (Markdown) the string to '- Title - #000 by @AuthorName'
        formated_pr = "- %s - %s by @%s" % (pr_title, pr_number, pr_author_name)

        # Add the PR to the list of PR's found in its respective category
        add_pr(formated_pr, labels)
    return len(divs)


if len(sys.argv) == 1:
    # In case of the user doesn't pass the date as an argument calls a input to type
    filter_date = raw_input("Type the date to start filter (yyyy-MM-dd): ")
else:
    # Get the first paramenter passed as an argument
    filter_date = sys.argv[1]

print ">> Starting to read Github from date %s until now " % filter_date

# Page number, starts with 1
page_number=1

# Number of PR's found in that page
actual_result = get_page(filter_date, page_number)

# Total number of PR's found
count = actual_result

# Loop to get each page until the last get 0 results
while actual_result > 0:
    page_number += 1
    actual_result = get_page(filter_date, page_number)
    count += actual_result

print "====> Found %s Pull Request(s) in %s page(s) \n" % (count, page_number-1)

for label in prs.iterkeys():
    print "**%s %s(s):**" % (len(prs[label]),label)
    for pr in prs[label]:
        print pr
    print "\n"
