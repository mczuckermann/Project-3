import React, { Component } from 'react';
import Jumbotron from '../../components/Jumbotron';
import { Container, Row, Col } from '../../components/Grid';
import { H1, H3, H4 } from '../../components/Headings';
import { Panel, PanelHeading, PanelBody } from '../../components/Panel';
import { Form, Input, FormBtn, FormGroup, Label } from '../../components/Form';
import API from '../../utils/API';
import axios from 'axios';
import { FormalArticle } from '../../components/FormalArticle';
import { Tabs } from 'react-tabs';
import { TabList } from 'react-tabs';
import { Tab } from 'react-tabs';
import { TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default class Articles extends Component {
  articleType = 'articles';
  bookType = 'books';

  state = {
    page: '0', //page of search results
    results: [], //array of results returned from api (articles)
    previousSearch: {}, //previous search term saved after search completed
    noResults: false,
    topic: '',
    sYear: '',
    eYear: '', //boolean used as flag for conditional rendering
    // ==========================
    pageBook: '0', //page of search results
    resultsBook: [], //array of results returned from api (articles)
    previousSearchBook: {}, //previous search term saved after search completed
    noResultsBook: false,
    topicBook: '',
    sYearBook: '',
    eYearBook: '', //boolean used as flag for conditional rendering
  };

  async componentDidMount() {
    await axios.defaults.headers.common['Authorization'];
    const jwt = await localStorage.getItem('jwtToken');
    console.log(process.env);
    if (jwt === null) {
      this.props.history.push('/login');
    }
  }

  saveArticle = article => {
    const user = localStorage.getItem('user');

    //creating new article object
    const newArticle = {
      title: article.headline.main,
      url: article.web_url,
      summary: article.snippet,
      date: article.pub_date,
      user: user,
    };

    API.saveArticleU(user, newArticle)
      .then(results => {
        //removing the saved article from the results in state
        let unsavedArticles = this.state.results.filter(
          article => article.headline.main !== newArticle.title
        );
        this.setState({ results: unsavedArticles });
      })
      .catch(err => console.log(err));
  };

  // saveBook = book => {
  //   const user = localStorage.getItem('user');

  //   //creating new article object
  //   const newArticle = {
  //     title: book.book_title,
  //     url: book.url,
  //     summary: book.summary,
  //     date: book.publication_dt,
  //     user: user,
  //   };

  //   API.saveArticleU(user, newArticle)
  //     .then(results => {
  //       //removing the saved article from the results in state
  //       let unsavedArticles = this.state.results.filter(
  //         article => article.headline.main !== newArticle.title
  //       );
  //       this.setState({ results: unsavedArticles });
  //     })
  //     .catch(err => console.log(err));
  // };

  handleFormSubmit = event => {
    event.preventDefault();
    const { topic, sYear, eYear } = this.state;
    const query = { topic, sYear, eYear };
    this.setState({ results: [] });
    this.getArticles(query);
  };

  // handleFormSubmitBook = event => {
  //   event.preventDefault();
  //   const { topicBook, sYearBook, eYearBook } = this.state;
  //   const query = { topicBook, sYearBook, eYearBook };
  //   this.setState({ resultsBook: [] });
  //   this.getBooks(query);
  // };

  getArticles = query => {
    let { topic, sYear, eYear } = query;
    let queryUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&page=${
      this.state.page
    }`;
    let key = `&api-key=0kc43d2ELOWiqzQYxbWK24FwYJwHXyJk`;

    //removing spaces and building the query url conditionally
    //based on presence of optional search terms
    if (topic.indexOf(' ') >= 0) {
      topic = topic.replace(/\s/g, '+');
    }
    if (topic) {
      queryUrl += `&fq=${topic}`;
    }
    if (sYear) {
      queryUrl += `&begin_date=${sYear}`;
    }
    if (eYear) {
      queryUrl += `&end_date=${eYear}`;
    }
    queryUrl += key;

    const self = this;
    //calling the API
    API.queryNYT(queryUrl)
      .then(results => {
        self.updateResults(results, query);
      })
      .catch(err => console.log(err));
  };

  handleInputChange = event => {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  };

  // getBooks = query => {
  //   let key = `&api-key=TZBzEuyISaV432LqBahDZC1YwILc41s7`;
  //   let queryUrl = 'https://api.nytimes.com/svc/books/v3/reviews.json?title=';
  //   let { topicBook } = query;
  //   if (topicBook.indexOf(' ') >= 0) {
  //     topicBook = topicBook.replace(/\s/g, '+');
  //   }
  //   if (topicBook) {
  //     queryUrl += `${topicBook}`;
  //   }
  //   queryUrl += key;
  //   API.queryNYT(queryUrl)
  //     .then(results => {
  //       console.log(results);
  //       this.setState(
  //         {
  //           resultsBook: [...this.state.resultsBook, ...results.data.results],
  //           previousSearchBook: query,
  //           topicBook: '',
  //         },
  //         function() {
  //           this.state.resultsBook.length === 0
  //             ? this.setState({ noResultsBook: true })
  //             : this.setState({ noResultsBook: false });
  //         }
  //       );
  //     })
  //     .catch(err => console.log(err));
  // };

  updateResults(results, query) {
    this.setState(
      {
        results: [...this.state.results, ...results.data.response.docs],
        previousSearch: query,
      },
      function() {
        this.state.results.length === 0
          ? this.setState({ noResults: true })
          : this.setState({ noResults: false });
      }
    );
  }

  //function that is called when user clicks the get more results button
  getMoreResults = () => {
    let { topic, eYear, sYear } = this.state.previousSearch;
    let query = { topic, eYear, sYear };
    //increments page number for search and then runs query
    let page = this.state.page;
    page++;
    this.setState({ page: page }, function() {
      this.getArticles(query);
    });
  };

  // getMoreResultsBook = () => {
  //   let { topicBook, eYearBook, sYearBook } = this.state.previousSearch;
  //   let query = { topicBook, eYearBook, sYearBook };
  //   //increments page number for search and then runs query
  //   let page = this.state.pageBook;
  //   page++;
  //   this.setState({ page: page }, function() {
  //     this.getArticles(query);
  //   });
  // };

  changeSearchType(searchType) {
    this.setState({ searchType: searchType });
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col size="sm-10" offset="sm-1">
            <Jumbotron>
              <H1 className="text-center">New York Times Best Seller Searcher</H1>
              <H4 className="text-center">Search • Save • Share</H4>
            </Jumbotron>
            <Tabs>
              <TabList>
                <Tab onClick={() => this.changeSearchType(this.articleType)}> Article</Tab>
                {/* <Tab onClick={() => this.changeSearchType(this.bookType)}> Books</Tab> */}
              </TabList>
              <TabPanel>
                <Panel>
                  <PanelHeading>
                    <H3>Search</H3>
                  </PanelHeading>
                  <PanelBody>
                    <Form style={{ marginBottom: '30px' }}>
                      <FormGroup>
                        <Label htmlFor="topic">Enter an article to search for:</Label>
                        <Input
                          onChange={this.handleInputChange}
                          name="topic"
                          value={this.state.topic}
                          placeholder="Topic"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="sYear">
                          Enter a beginning date to search for (optional):
                        </Label>
                        <Input
                          onChange={this.handleInputChange}
                          type="date"
                          name="sYear"
                          value={this.state.sYear}
                          placeholder="Start Year"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="eYear">Enter an end date to search for (optional):</Label>
                        <Input
                          onChange={this.handleInputChange}
                          type="date"
                          name="eYear"
                          value={this.state.eYear}
                          placeholder="End Year"
                        />
                      </FormGroup>
                      <FormBtn
                        disabled={!this.state.topic}
                        onClick={this.handleFormSubmit}
                        type="info"
                      >
                        Submit
                      </FormBtn>
                    </Form>
                  </PanelBody>
                </Panel>
                {this.state.noResults ? (
                  <H1>No results found. Please try again</H1>
                ) : this.state.results.length > 0 ? (
                  <Panel>
                    <PanelHeading>
                      <H3>Results</H3>
                    </PanelHeading>
                    <PanelBody>
                      {this.state.results.map((article, i) => (
                        <FormalArticle
                          key={i}
                          title={article.headline.main}
                          url={article.web_url}
                          summary={article.snippet}
                          date={article.pub_date}
                          type="Save"
                          onClick={() => this.saveArticle(article)}
                        />
                      ))}
                      <FormBtn type="warning" additional="btn-block" onClick={this.getMoreResults}>
                        Get more results
                      </FormBtn>
                    </PanelBody>
                  </Panel>
                ) : (
                  ''
                )}
              </TabPanel>
              {/* <TabPanel>
                <Panel>
                  <PanelHeading>
                    <H3>Search</H3>
                  </PanelHeading>
                  <PanelBody>
                    <Form style={{ marginBottom: '30px' }}>
                      <FormGroup>
                        <Label htmlFor="topic">Enter a book to search for:</Label>
                        <Input
                          onChange={this.handleInputChange}
                          name="topicBook"
                          value={this.state.topicBook}
                          placeholder="Topic"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="sYear">
                          Enter a beginning date to search for (optional):
                        </Label>
                        <Input
                          onChange={this.handleInputChange}
                          type="date"
                          name="sYearBook"
                          value={this.state.sYearBook}
                          placeholder="Start Year"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="eYear">Enter an end date to search for (optional):</Label>
                        <Input
                          onChange={this.handleInputChange}
                          type="date"
                          name="eYearBook"
                          value={this.state.eYearBook}
                          placeholder="End Year"
                        />
                      </FormGroup>
                      <FormBtn
                        disabled={!this.state.topicBook}
                        onClick={this.handleFormSubmitBook}
                        type="info"
                      >
                        Submit
                      </FormBtn>
                    </Form>
                  </PanelBody>
                </Panel>
                {this.state.noResultsBook ? (
                  <H1>No results found. Please try again</H1>
                ) : this.state.resultsBook.length > 0 ? (
                  <Panel>
                    <PanelHeading>
                      <H3>Results</H3>
                    </PanelHeading>
                    <PanelBody>
                      {this.state.resultsBook.map((book, i) => (
                        <FormalArticle
                          key={i}
                          title={book.book_title}
                          url={book.url}
                          summary={book.summary}
                          date={book.publication_dt}
                          type="Save"
                          onClick={() => this.saveBook(book)}
                        />
                      ))}
                      <FormBtn
                        type="warning"
                        additional="btn-block"
                        onClick={this.getMoreResultsBook}
                      >
                        Get more results
                      </FormBtn>
                    </PanelBody>
                  </Panel>
                ) : (
                  ''
                )}
              </TabPanel> */}
            </Tabs>
          </Col>
        </Row>
      </Container>
    );
  }
}
