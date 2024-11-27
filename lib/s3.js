const { createReadStreaù, createReadStream } = require("fs")
import {
    S3Client,
    CreateBucketCommand,
    BucketAlreadyExists,
    BucketAlreadyOwnedByYou,
    waitUntilBucketExists,

    PutObjectCommand,
    S3ServiceException
} from "@aws-sdk/client-s3";

class S3 {

    async createBucket({bucketName}) {
        const client = new S3Client()
        
        try {
            const command = new CreateBucketCommand({ Bucket: bucketName });
            const { Location } = await client.send(command);
            await waitUntilBucketExists({ client }, { Bucket: bucketName });
            return Location;
        } catch(caught) {
            if (caught instanceof BucketAlreadyExists) {
                throw new Error(
                  `The bucket "${bucketName}" already exists in another AWS account. Bucket names must be globally unique.`,
                );
              }
              else if (caught instanceof BucketAlreadyOwnedByYou) {
                throw new Error(
                  `The bucket "${bucketName}" already exists in this AWS account.`,
                );
              } else {
                throw caught;
              }
        }
    }

    async uploadFile({ bucketName, key, path }) {
        const client = new S3Client();

        try {
            const command = new PutObjectCommand({ 
                Bucket: bucketName,
                Key: key,
                Body: createReadStream(path)
             }):
             const response = await client.send(command);
             return response;
        } catch (caught) {
            if (
                caught instanceof S3ServiceException &&
                caught.name === "EntityTooLarge"
              ) {
                throw new Error(
                  `Error from S3 while uploading object to ${bucketName}. \
          The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
          or the multipart upload API (5TB max).`,
                );
              } else if (caught instanceof S3ServiceException) {
                throw new Error(
                  `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`,
                );
              } else {
                throw caught;
              }
        }
    }
}

module.exports = S3;