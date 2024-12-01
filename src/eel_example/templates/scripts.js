const MSG_TYPES = {
  // Bool = "Bool";
  // Int32 = "Int32";
  // Int64 = "Int64";
  // Float32 = "Float32";
  // Float64 = "Float64";
  // String = "String";
  // Transform = "Transform";
  // Pose = "Pose";
  // Image = "Image";
  Bool: "Bool:std_msgs",
  Int32: "Int32:std_msgs",
  Int64: "Int64:std_msgs",
  Float32: "Float32:std_msgs",
  Float64: "Float64:std_msgs",
  String: "String:std_msgs",
  Transform: "Transform:geometry_msgs",
  Pose: "Pose:geometry_msgs",
  Image: "Image:sensor_mags",
};

/** ROS PUBLISHER */
console.log("publisher");
const publishButtons = document.getElementsByClassName("publish");
console.log(publishButtons);
for (const btn of publishButtons) {
  // PublisherはButtonエレメントにのみ限定する
  if (btn.tagName !== "BUTTON") {
    continue;
  }

  btn.addEventListener("click", async (e) => {
    const rostopic_name = btn.getAttribute("name");
    const type = btn.getAttribute("type");
    const value = btn.getAttribute("value");
    console.log(rostopic_name, type, value);
    eel.ros_publish(rostopic_name, type, value);
  });
}

/** ROS SUBSCRIBER */
console.log("subscriber");
const subscribeElements = document.getElementsByClassName("subscribe");
console.log(subscribeElements);
for (const element of subscribeElements) {
  const topic_name = element.getAttribute("name");
  const type = element.getAttribute("type");
  eel.ros_subscribe(topic_name, type);
}

eel.expose(updateSubscribedValue);
function updateSubscribedValue(topicName, type, value) {
  // console.log(topicName, type, value);
  const topicElements = document.getElementsByName(topicName);
  for (const element of topicElements) {
    switch (type) {
      case MSG_TYPES.Bool:
        element.innerText = value;
        break;
      case MSG_TYPES.Int32:
        element.innerText = value;
        break;
      case MSG_TYPES.Int64:
        element.innerText = value;
        break;
      case MSG_TYPES.Float32:
        element.innerText = value;
        break;
      case MSG_TYPES.Float64:
        element.innerText = value;
        break;
      case MSG_TYPES.String:
        element.innerText = value;
        break;
      case MSG_TYPES.Transform:
        // valueは配列が来る事を期待
        inputs = element.querySelectorAll("input");
        length = Math.min(inputs.length, value.length);
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].value = value[i];
        }
        break;
      case MSG_TYPES.Pose:
        // valueは配列が来る事を期待
        inputs = element.querySelectorAll("input");
        length = Math.min(inputs.length, value.length);
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].value = value[i];
        }
        break;
      case MSG_TYPES.Image:
        img = element.querySelector("img");
        img.src = "data:image/jpeg;base64," + value;
        break;
      default:
        console.error("Unexpected ROS Message type:", type);
        break;
    }
  }
}

/** ROSPARAM SETTER */
const paramInputs = document.getElementsByClassName("param");
for (const input of paramInputs) {
  input.addEventListener("blur", async (e) => {
    const name = input.getAttribute("name");
    const type = input.getAttribute("type");
    const value = input.getAttribute("value");
    eel.ros_set_param(name, type, value);
  });
}

/** ROSPARAM GETTER */
eel.expose(updateParam);
function updateParam(param_name, param_value) {
  if (typeof param_value != "string") {
    throw Error(
      `[CA] Rosparam input view only accepts string, received ${typeof param_value}`
    );
  }
  targetInputs = document.getElementByName(param_name);
  for (const input of targetInputs) {
    input.getAttribute("value").value = param_value;
  }
}

// Health check to notify successful js runtime.
eel.expose(health);
function health(value) {
  console.log("[CA] Python -> JS: OK");
  return value;
}
eel.health("success");
