[User presses Upload]
          |
          v
[JS Layer] - Create storyId, optimistic UI
          |
          v
[Add to Queue] - status="pending", retryCount=0
          |
          v
[Schedule WorkManager Job] -> passes storyId + file info
          |
          v
[Worker starts] 
          |
          +--> mark queue: status="sending", lastAttemptAt=now
          |
          v
[Upload to server]
          |
          +--> HTTP 200 OK?
          |       |
          |       +--> mark queue: success -> remove or keep
          |       |
          |       +--> emit JS event -> update Redux
          |
          +--> HTTP 401?
          |       |
          |       +--> mark queue: auth_error
          |       +--> emit JS event -> JS triggers token refresh
          |
          +--> HTTP error / network failure?
                  |
                  +--> increment retryCount
                  +--> mark queue: failed
                  +--> exponential backoff -> reschedule Worker
