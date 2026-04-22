export const LESSON_CONTENT: Record<string, string> = {
  'topic-1-1':
    'ROS2 (Robot Operating System 2) is a flexible middleware used for developing robot software. It provides tools, libraries, and conventions to help developers build complex robotic systems. ROS2 enables communication between different parts of a robot system using a distributed architecture. It supports distributed computing and allows multiple processes (called nodes) to work together efficiently. ROS2 is designed to be scalable and supports real-time applications in robotics. It is widely used in autonomous systems and industrial robots.',
  'topic-1-2':
    'The ROS2 communication system is based on a publish-subscribe model. Nodes can publish data to topics and subscribe to topics to receive data from other nodes. This allows for a loosely coupled system where nodes do not need to know about each other directly.',
  'topic-2-1':
    'ROS2 services provide a request-reply communication pattern. A service client sends a request to a service server and waits for a response. This is useful for operations that require synchronous communication.',
  'topic-2-2':
    'Actions are a higher-level abstraction built on top of topics and services. They provide a way to implement long-running, goal-oriented tasks with feedback and result information.',
};
