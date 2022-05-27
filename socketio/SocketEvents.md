# Socket.io client-server communication events

## expected client events

### 'connection'

The default event that is emitted when a new client connects

### 'disconnect'

The default event that is emitted when a client disconnects

### 'uploadStart'

The event to be emitted when an upload session was started. Will be responded with 'uploadDataUpdate'- and 'uploadDone'-server events

## server emitted events

### 'uploadDataUpdate'

A new chunk was uploaded, will receive the following content:

```json
{
  "part": "_Stream Part data_",
  "loaded": "_Stream loaded data_",
  "total": "_Stream total data_",

  "id": "_upload ID the user asked for",
  "filename": "_new filename without complete path_"
}
```

### 'uploadDone'

The upload was successful

```json
{
  "id": "_upload ID the user asked for"
}
```
