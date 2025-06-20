declare module "multer-s3" {
  import { Request } from "express";
  import { StorageEngine } from "multer";
  import { S3Client } from "@aws-sdk/client-s3";

  interface MulterS3Options {
    s3: S3Client;
    bucket:
      | string
      | ((
          req: Request,
          file: any,
          cb: (error: any, bucket?: string) => void
        ) => void);
    acl?:
      | string
      | ((
          req: Request,
          file: any,
          cb: (error: any, acl?: string) => void
        ) => void);
    key?: (
      req: Request,
      file: any,
      cb: (error: any, key?: string) => void
    ) => void;
    metadata?: (
      req: Request,
      file: any,
      cb: (error: any, metadata?: any) => void
    ) => void;
    contentType?:
      | string
      | ((
          req: Request,
          file: any,
          cb: (error: any, mime?: string) => void
        ) => void);
  }

  function multerS3(options: MulterS3Options): StorageEngine & {
    AUTO_CONTENT_TYPE: (
      req: Request,
      file: any,
      cb: (error: any, mime?: string) => void
    ) => void;
  };

  namespace multerS3 {
    const AUTO_CONTENT_TYPE: (
      req: Request,
      file: any,
      cb: (error: any, mime?: string) => void
    ) => void;
  }

  export = multerS3;
}
