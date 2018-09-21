import { FilesCollection } from 'meteor/ostrio:files';

export const Institution = new FilesCollection({
  collectionName: 'Institution',
  storagePath: `${process.env.PWD}/public/uploads/logos/`,
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 5Gb, and only in png/jpg/jpeg formats
    if (file.size <= 1009120 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 1MB';
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      // check real mimetype
      const { Magic, MAGIC_MIME_TYPE } = require('mmmagic'); // eslint-disable-line
      const magic = new Magic(MAGIC_MIME_TYPE);
      magic.detectFile(
        file.path,
        Meteor.bindEnvironment((err, mimeType) => {
          if (err || !~mimeType.indexOf('image')) { // eslint-disable-line
            // is not a real image --> delete
            console.log('onAfterUpload, not an image: ', file.path); // eslint-disable-line
            this.remove(file._id);
          }
        }),
      );
    }
  },
});
