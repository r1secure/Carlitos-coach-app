# Spec: Video Analysis Enhancements

## ADDED Requirements

### Requirement: Biomechanical Metrics Calculation
The system MUST calculate and store key biomechanical angles (knee flexion, elbow flexion, shoulder rotation) for each analyzed frame.

#### Scenario: Analyzing a new video
Given a user uploads a video
When the analysis task runs
Then it calculates the angle between Hip-Knee-Ankle for each frame
And stores this metric in the analysis result.

### Requirement: Playback Speed Control
The video player MUST allow users to adjust the playback speed to 0.5x and 1.0x.

#### Scenario: Slowing down playback
Given a user is watching an analyzed video
When they select "0.5x" from the speed control
Then the video plays at half speed
And the pose overlay remains synchronized.

### Requirement: Comparison Mode
The system MUST provide a comparison mode to view two videos side-by-side.

#### Scenario: Comparing with a reference
Given a user is viewing their video
When they click "Compare" and select a reference video
Then the interface shows both videos side-by-side
And both videos can be played.
