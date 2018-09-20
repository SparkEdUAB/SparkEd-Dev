// TODO:  properly route back to the programs, can do this by setting the id in session
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Session } from "meteor/session";
import i18n from "meteor/universe:i18n";
import { withTracker } from "meteor/react-meteor-data";
import { _Courses } from "../../../api/courses/courses";
import { Titles } from "../../../api/settings/titles";
import {
  handleCheckboxChange,
  handleCheckAll,
  getCheckBoxValues
} from "../Utilities/CheckBoxHandler.jsx";
import MainModal from "../../../ui/modals/MainModal.jsx";
import { closeModal } from "../../../ui/modals/methods.js";
import * as config from "../../../../config.json";
import { formatText } from "../../utils/utils";
import { Button, Row, Col, Table, Icon } from "antd";
import { ThemeContext } from "../../containers/AppWrapper";



export const T = i18n.createComponent();

export class Coursess extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      isOpen: false,
      modalIdentifier: "", // Course Id
      modalType: "", // Add or Edit
      title: "", // Add Course or Edit Course
      confirm: "",
      reject: "",
      year: "",
      name: "",
      owner: "",
      ids: [],
      table_title: "Course",
      sub_title: "Unit",
      item: ''
    };
  }



  componentDidMount() {
    Session.set("course", " active");
    window.scrollTo(0, 0);
  }
  componentWillUnmount() {
    Session.set("course", "");
  }
  // close the modal, close the modal, and clear the states;
  close = () => {
    this.setState(closeModal);
  };

  // ide => modalType, id=> courseId
  toggleEditModal = (
    ide,
    yr = "",
    id = "",
    name = "",
    code = "",
    owner = ""
  ) => {
    if (!Roles.userIsInRole(Meteor.userId(), ["admin", "content-manager"])) {
      Materialize.toast(
        "Only Admins and Content-Manager can edit Courses",
        3000,
        "error-toast"
      );
      return;
    }
    this.name = name;
    this.code = code;
    this.year = yr;
    this.owner = owner;
    switch (ide) {
      case "edit":
        this.setState({
          modalIdentifier: id,
          modalType: ide,
          title: `Edit ${Session.get("course_title")}`,
          confirm: <T>common.actions.save</T>,
          reject: <T>common.actions.close</T>,
          name: this.name,
          code: this.code,
          year: this.year,
          owner: this.owner
        });
        break;
      case "add":
        this.setState({
          modalIdentifier: id,
          modalType: ide,
          title: `Add ${Session.get("course_title")}`,
          confirm: <T>common.actions.save</T>,
          reject: <T>common.actions.close</T>
        });
        break;
      case "del":
        // const course = getCheckBoxValues('chk');
        const course = this.state.selectedRowKeys;
        const count = course.length;
        const name = count > 1 ? "courses" : "course";
        if (count < 1) {
          Materialize.toast(
            "Please check atleast one course",
            3000,
            "error-toast"
          );
          return;
        }
        this.setState({
          modalIdentifier: "id",
          modalType: ide,
          title: `Are you sure to delete ${count} ${name}`,
          confirm: <T>common.actions.yes</T>,
          reject: <T>common.actions.no</T>,
          ids: course
        });
        break;
      case "field":
        this.setState({
          title: "Edit Table titles on this page",
          confirm: <T>common.actions.save</T>,
          reject: <T>common.actions.close</T>,
          modalType: ide,
          table_title: yr,
          sub_title: id
        });
        break;
    }
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  // route to whats contained in the course
  static handleUrl(id, year, event) {
    event.preventDefault();
    Session.set("courseIde", id);
    FlowRouter.go(`/dashboard/units/${id}?y=${year}`);
  }

  // Adding new Course
  handleSubmit(e) {
    e.preventDefault();
    let course;
    let courseCode;
    let year;
    let details;
    const { target } = e;
    const {
      modalType,
      modalIdentifier,
      ids,
      owner,
      table_title,
      sub_title
    } = this.state;

    switch (modalType) {
      case "add":
        course = target.course.value;
        courseCode = target.courseCode.value;
        year = target.year.value;
        details = { year };
        const reference = config.isHighSchool ? "subject" : "course";
        const courseId = new Meteor.Collection.ObjectID().valueOf();
        Meteor.call(
          "course.add",
          courseId,
          course,
          courseCode,
          details,
          (err, res) => {
            err
              ? (Materialize.toast(err.reason, 3000, "error-toast"),
                Meteor.call(
                  "logger",
                  formatText(err.message, Meteor.userId(), "course-add"),
                  "error"
                ))
              : Meteor.call(
                  "insert.search",
                  courseId,
                  { courseId },
                  course,
                  reference,
                  err => {
                    err
                      ? Materialize.toast(err.reason, 3000, "error-toast")
                      : Materialize.toast(
                          `Successfully added ${course} `,
                          3000,
                          "success-toast"
                        );
                  }
                );
          }
        );

        break;

      case "edit":
        course = target.course.value;
        courseCode = target.courseCode.value;
        year = target.year.value;
        Meteor.call(
          "course.edit",
          this.state.selectedRowKeys[0],
          course,
          courseCode,
          year,
          owner,
          err => {
            err
              ? (Materialize.toast(err.reason, 3000, "error-toast"),
                Meteor.call(
                  "logger",
                  formatText(err.message, Meteor.userId(), "course-edit"),
                  "error"
                ))
              : Meteor.call("updateSearch", modalIdentifier, course, err => {
                  err
                    ? Materialize.toast(err.reason, 3000, "error-toast")
                    : Materialize.toast(
                        `${course} Successfully updated`,
                        3000,
                        "success-toast"
                      );
                });
          }
        );
        break;

      case "del":
        let count = 0;
        // const courses = ids;

        this.state.selectedRowKeys.forEach((v, k, arra) => {
          count += 1;
          const name = count > 1 ? "courses" : "course";
          Meteor.call("course.remove", v, err => {
            err
              ? (Materialize.toast(err.reason, 3000, "error-toast"),
                Meteor.call(
                  "logger",
                  formatText(err.message, Meteor.userId(), "course-remove"),
                  "error"
                ))
              : Meteor.call("removeSearchData", v),
              err => {
                err
                  ? Materialize.toast(err.reason, 3000, "error-toast")
                  : Meteor.call("insertDeleted", v, err => {
                      err
                        ? Materialize.toast(err.reason, 3000, "error-toast")
                        : Materialize.toast(
                            `${count} ${name} successfully deleted`,
                            3000,
                            "success-toast"
                          );
                    });
              };
          });
        });
        break;

      case "field":
        const name = target.course.value;
        const title_id = Session.get("title_id");
        // update.title'(id, title, sub)
        Meteor.call("update.title", title_id, table_title, sub_title, err => {
          err
            ? (Materialize.toast(err.reason, 3000, "error-toast"),
              Meteor.call(
                "logger",
                formatText(err.message, Meteor.userId(), "update-title"),
                "error"
              ))
            : Materialize.toast(
                "Successfully updated the titles",
                3000,
                "success-toast"
              );
        });
    }
    // close modal when done;
    this.setState({
      isOpen: false
    });
  }

  saveTitle = ({ target: { value } }, type) => {
    switch (type) {
      case "sub":
        this.setState({
          sub_title: value
        });
        break;

      default:
        this.setState({
          table_title: value
        });
        break;
    }
  };

  state = {
    selectedRowKeys: [] // Check here to configure the default column
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

editCourse = (e, id) => {

   this.setState(prevState => ({ isOpen: !prevState.isOpen }));
}

  render() {
    const {
      isOpen,
      title,
      confirm,
      reject,
      modalType,
      name,
      code,
      year,
      table_title,
      sub_title
    } = this.state;
    const { titles, courses } = this.props;
    let new_title = "";
    let new_sub_title = "";
    if (titles) {
      new_title = titles.title;
      new_sub_title = titles.sub_title;
      Session.set({
        title_id: titles._id,
        course_title: new_title
      });
    }

    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: "all-data",
          text: "Select All Data",
          onSelect: item => {
            this.setState({
              selectedRowKeys: [...Array(46).keys()], // 0...45
              item
            });
          }
        }
      ],
      onSelection: this.onSelection
    };

    const columns = [
            {
              title: "Course",
              dataIndex: "name"
            },
            {
              title: "Code",
              dataIndex: "code"
            },
            {
              title: 'created At',
              dataIndex:'createdAt',
              render: date => <span>{date.toDateString()} </span>
            },
            {
              title: 'Edit',
              dataIndex:'_id',
              render: id => <span onClick={e => this.editCourse(e, id)} ><Icon type="edit" /> </span>
            }
          ];


    return (
      <ThemeContext.Consumer>
        {color => (
          <>
            <MainModal
              show={isOpen}
              onClose={this.close}
              subFunc={this.handleSubmit}
              title={title}
              confirm={confirm}
              reject={reject}
            >
              {modalType === "del" ? (
                <span />
              ) : modalType === "field" ? (
                <div className="row">
                  <div className="row">
                    <div className="input-field col s12 m4">
                      <input
                        value={table_title}
                        placeholder={table_title}
                        name="course"
                        type="text"
                        className="validate"
                        onChange={e => this.saveTitle(e, "title")}
                      />
                    </div>
                    <div className="input-field col s12 m4">
                      <input
                        value={`Edit ${table_title}`}
                        name="edit_course"
                        type="text"
                        className="validate"
                        readOnly
                      />
                    </div>
                    <div className="input-field col s12 m4">
                      <input
                        value={sub_title}
                        name="edit_course"
                        type="text"
                        className="validate"
                        onChange={e => this.saveTitle(e, "sub")}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="input-field">
                  <input
                    placeholder={`Name of ${new_title}`}
                    defaultValue={name}
                    type="text"
                    className="validate clear"
                    required
                    name="course"
                  />
                  <input
                    placeholder={`${new_title} Code`}
                    defaultValue={code}
                    type="text"
                    className="validate clear"
                    required
                    name="courseCode"
                  />
                  <input
                    placeholder={`${new_title} Year eg: 1-12`}
                    defaultValue={year}
                    id="year"
                    type="text"
                    pattern="[1-9]"
                    className=" clear"
                    name="year"
                    title={`${new_title} Year eg: 1-12`}
                  />
                </div>
              )}
            </MainModal>

            <Row>
              <h4>
                <T>common.manage.manage</T> {new_title}
              </h4>
            </Row>
            <Row>
              <Col xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                <Button
                  type="danger"
                  icon="close"
                  onClick={e => this.toggleEditModal("del", e)}
                >
                  <T>common.actions.delete</T>
                </Button>
              </Col>
              <Col xs={{ span: 11, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                <Button
                  type="primary"
                  icon="plus"
                  onClick={e => this.toggleEditModal("add", e)}
                >
                  <T>common.actions.new</T>
                </Button>
              </Col>
              <Col xs={{ span: 11, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                <Button
                  type="primary"
                  icon="edit"
                  onClick={e => this.toggleEditModal("edit", e)}
                >
                  <T>common.actions.edit</T>
                </Button>
              </Col>
            </Row>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={courses}
              rowKey={item => item._id}
            />
          </>
        )}
      </ThemeContext.Consumer>
    );
  }
}

Coursess.propTypes = {
  courses: PropTypes.array.isRequired
};

export default withTracker(() => {
  Meteor.subscribe("searchdata");
  Meteor.subscribe("deleted");
  Meteor.subscribe("titles");
  Meteor.subscribe("courses");
  return {
    courses: _Courses.find({ createdBy: Meteor.userId() }).fetch(),
    titles: Titles.findOne({})
  };
})(Coursess);
