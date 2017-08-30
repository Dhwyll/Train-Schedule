# Train-Schedule
Exercise to show familiarity with Firebase and Moment

The user can add a train, providing the name, destination, starting time, and frequency of the train.  The system then calculates when the next train is scheduled to depart.  If it's right now, it indicates so.  Otherwise, if it's in the future, it indicates that time and how many minutes away that is.  The system understands if the train started in the past and thus is on its frequency schedule or if it starts in the future and thus needs to wait until then for the first train to go.

This project primarily uses Firebase to store and retrieve information and Moment to manage the time math.
