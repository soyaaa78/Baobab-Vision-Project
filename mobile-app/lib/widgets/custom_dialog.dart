
import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

customDialog(BuildContext context, {required String title, required String content}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 30.sp,
                color: Colors.black,
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, color: Colors.black),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        content: Text(
          content,
          style: TextStyle(
            fontSize: 14.sp,
            color: Colors.black,
          ),
        ),
        actions: <Widget>[
          ElevatedButton(
            child: Text(
              'Okay',
              style: TextStyle(
                color: WHITE_COLOR,
                fontSize: 16.sp,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: BLACK_COLOR,
              foregroundColor: BLACK_COLOR,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      );
    },
  );
}

customShowImageDialog(BuildContext context, {required String imageUrl}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: Alignment.topRight,
              child: IconButton(
                icon: Icon(Icons.close, color: Colors.black),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            Container(
              height: 300.h,
              child: Center(
                child: imageUrl.startsWith('http')
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        progressIndicatorBuilder: (context, url, downloadProgress) =>
                            CircularProgressIndicator(
                          color: WHITE_COLOR,
                          value: downloadProgress.progress,
                        ),
                        errorWidget: (context, url, error) => Icon(
                          Icons.error,
                          size: 100.sp,
                        ),
                      )
                    : Image.asset(
                        imageUrl,
                        fit: BoxFit.cover,
                      ),
              ),
            ),
          ],
        ),
      );
    },
  );
}

customOptionDialog(
  BuildContext context, {
  required String title,
  required String content,
  required Function onYes,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            CustomText(
              text: title,
              fontSize: 30.sp,
              color: Colors.black,
            ),
            IconButton(
              icon: Icon(Icons.close, color: Colors.black),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        content: CustomText(text: content, color: Colors.black, fontSize: 10.sp),
        actions: <Widget>[
          OutlinedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: CustomText(text: 'No', color: Colors.black, fontSize: 10.sp),
          ),
          ElevatedButton(
            child: CustomText(
              text: 'Yes',
              color: WHITE_COLOR,
              fontSize: 16.sp,
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: BLACK_COLOR,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.of(context).pop();
              onYes();
            },
          ),
        ],
      );
    },
  );
}
